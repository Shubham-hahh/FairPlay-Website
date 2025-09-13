"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Video } from '@/types'
import { Topbar } from '@/components/ui/Topbar/Topbar'
import { Sidebar } from '@/components/ui/Sidebar/Sidebar'
import styles from './VideoDetailPage.module.css'
import { ToastProvider, useToast } from "@/components/ui/Toast/Toast";

export default function VideoDetailPage() {
  const { error: toastError } = useToast();
  const { success: toastSuccess } = useToast();
  const { info: toastInfo } = useToast();
  const router = useRouter()
  const { id } = router.query
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const [video, setVideo] = useState<Video | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModerator, setisModerator] = useState(false)
  const [userId, setuserID] = useState("");


  const fetchModeratorStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_moderator, is_admin")
        .eq("id", user.id)
        .single();
      setisModerator(profile?.is_moderator ?? profile?.is_admin ?? false);
      setuserID(user.id);
      
    }
  }, []);
  useEffect(() => {
    if (!id) return
    fetchModeratorStatus();
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: video, error: videoError } = await supabase
          .from('videos')
          .select('id, title, description, type, url, youtube_id, quality_score, themes, verifiedOnce, verifiedOnce_user_id,refusedOnce_user_id, refusedOnce, is_verified, is_refused')
          .eq('id', id as string)
          .single()
        if (videoError || !video) throw new Error(videoError?.message || 'Vidéo non trouvée')
        setVideo(video as Video)
        const { data: authData } = await supabase.auth.getUser()
        const user = authData.user
        if (user) {
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('score')
            .eq('video_id', id as string)
            .eq('user_id', user.id)
            .maybeSingle()
          if (ratingData) setUserRating(ratingData.score)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])
 const updateVideo = useCallback(async (video: Video) => {
    const { error } = await supabase 
      .from("videos")
      .update({
        is_verified: video.is_verified,
        is_refused: video.is_refused,
        verifiedOnce: video.verifiedOnce,
        refusedOnce: video.refusedOnce,
        verifiedOnce_user_id: video.verifiedOnce_user_id,
        refusedOnce_user_id: video.refusedOnce_user_id,
      })
      .eq("id", video.id);
    if (error) {
      toastError?.("Error updating video: " + error.message);
      return;
    }

  }, [toastError]);


  const handleRefuse = useCallback(async (video:Video) => {
    if (userId === video?.refusedOnce_user_id) {
      toastError("You have already refused this video.");
      return;
    }
    if (userId === video?.verifiedOnce_user_id) {
      video.verifiedOnce_user_id = null;
      video.verifiedOnce = false;
    }
    if (!video?.refusedOnce) {
      video.refusedOnce = true;
      video.refusedOnce_user_id = userId
  } 
    if (video.refusedOnce && !video.verifiedOnce && userId !== video.refusedOnce_user_id) {
      video.is_refused = true;
    }
    if (video.refusedOnce && video.verifiedOnce && userId !== video.refusedOnce_user_id && userId !== video.verifiedOnce_user_id) {
      video.is_refused = true;
    }
    toastSuccess("Video refused successfully.");

    await updateVideo(video);

}, [userId, updateVideo]);
  const handleRate = async (score: number) => {
    try {
      setUserRating(score)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) throw new Error('Utilisateur non authentifié')
      const userId = authData.user.id
      const { error: upsertError } = await supabase
        .from('ratings')
        .upsert({ video_id: id as string, user_id: userId, score }, { onConflict: 'video_id,user_id' })
      if (upsertError) throw upsertError
      const { data: refreshed } = await supabase
        .from('videos')
        .select('quality_score')
        .eq('id', id as string)
        .single()
      if (refreshed) setVideo(prev => prev ? { ...prev, quality_score: refreshed.quality_score } : prev)
    } catch (err: any) {
      setError(err.message)
    }
  }
  if (!video) return

  return (
    <>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="videos" />
        <main className="main-content">
          <div className={styles.videoDetailContainer}>
            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-center" style={{ color: 'red' }}>Error: {error}</p>}
            {!loading && video && (
              <>
                {/* Player */}
                {video.type === 'youtube' && video.youtube_id ? (
                  <iframe
                    className={styles.videoPlayer}
                    src={`https://www.youtube.com/embed/${video.youtube_id}`}
                    allowFullScreen
                  />
                ) : (
                  video.url && <video className={styles.videoPlayer} controls src={video.url} />
                )}

                {/* Title */}
                <h1 className={styles.title}>{video.title}</h1>

                {/* Rating + Download/Donate */}
                <div className={styles.metaRow}>
                  <div className={styles.ratingSection}>
                    <span className={styles.averageScore}>
                      Average: {video.quality_score != null ? video.quality_score.toFixed(1) : 'N/A'} / 5
                    </span>
                    <span>Your score:</span>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => handleRate(n)}
                        className={`${styles.ratingButton} ${n <= userRating ? styles.active : ''}`}
                      >
                        {n}⭐
                      </button>
                    ))}
                  </div>
                  <div className={styles.actions}>
                    {isModerator&&(
                      <div>
                        
                        <button className={styles.refuseButton} onClick={() => {
                                if (video) {
                                  handleRefuse(video);
                                }
                              }}
                              >❌ Refuse
                        </button>
                      </div>
                    )}
                    {video.url && (
                      <a href={video.url} download className={styles.downloadButton}>
                        Download
                      </a>
                    )}
                    <button className={styles.donateButton}>Donate To the Creator</button>
                  </div>
                </div>

                {/* Description */}
                <div className={`${styles.descriptionContainer} ${descriptionExpanded ? styles.expanded : ''}`}>
                  <p className={styles.description}>{video.description}</p>
                </div>
                <button
                  className={styles.toggleDescription}
                  onClick={() => setDescriptionExpanded(prev => !prev)}
                >
                  {descriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}