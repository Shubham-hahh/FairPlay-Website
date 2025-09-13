import { useState, useCallback, useEffect, FC, memo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Topbar } from "@/components/ui/Topbar/Topbar";
import { Sidebar } from "@/components/ui/Sidebar/Sidebar";
import { ToastProvider, useToast } from "@/components/ui/Toast/Toast";
import styles from './adminpanel.module.css';
import VideoList from "@/components/mychannel/VideoList";
import { Video } from "@/types";

export default function AdminPanel() {
  const { error: toastError } = useToast();
  const { success: toastSuccess } = useToast();
  const { info: toastInfo } = useToast();

  const [isModerator, setisModerator] = useState(false);
  const [isloggedin, setIsloggedin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [videos, setVideos] = useState<any[]>([]);
  const [userId, setuser] = useState("");

  const fetchModeratorStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsloggedin(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_moderator, is_admin")
        .eq("id", user.id)
        .single();
      setisModerator(profile?.is_moderator ?? profile?.is_admin ?? false);
      //setuser(user?.id);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_verified", !true)
      .eq("is_refused", false)
      .order("created_at", { ascending: true });
    if (error) {
      toastError?.("Error fetching videos: " + error.message);
      return [];
    }
    return data || [];
  }, [toastError]);
    const fetchusersession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user?.id) {
      setuser(user.id);
    } else {
      toastError("User ID is undefined");
    }
  }, [supabase.auth]);


  useEffect(() => {
    (async () => {
      await fetchModeratorStatus();
      if (isModerator) {
        await fetchusersession();
        setVideos(await fetchVideos());
      }
      setLoading(false);
    })();
  }, [isModerator, fetchModeratorStatus, fetchVideos]);




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

  const handleAprove = useCallback(async (video: Video) => {
    if (userId === video.verifiedOnce_user_id) {
      toastError("You have already approved this video.");
      return;
    }
    if (userId === video.refusedOnce_user_id) {
      video.refusedOnce_user_id = null;
      video.refusedOnce = false;
    }
    if (!video.verifiedOnce) {
      video.verifiedOnce = true;
      video.verifiedOnce_user_id = userId

    }
    if (video.verifiedOnce && !video.is_refused && userId !== video.verifiedOnce_user_id) {
      video.is_verified = true;
    }
    toastSuccess("Video approved successfully.");
    await updateVideo(video);
  }, [userId, updateVideo]);

  const handleRefuse = useCallback(async (video: Video) => {
    if (userId === video.refusedOnce_user_id) {
      toastError("You have already refused this video.");
      return;
    }
    if (userId === video.verifiedOnce_user_id) {
      video.verifiedOnce_user_id = null;
      video.verifiedOnce = false;
    }
    if (!video.refusedOnce) {
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

  if (loading) {
    return (
      <ToastProvider>
        <Topbar />
        <div className="page-wrapper container">
          <Sidebar active="channel" />
          <main className="main-content">
            <div style={{ textAlign: "center" }}>Loading...</div>
          </main>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Topbar />
      <div className="page-wrapper container">
        <Sidebar active="channel" />
        <main className="main-content">
          {isModerator ? (
            <div>
              <h1 className={styles.settingsTitle}>Welcome to the Admin Panel</h1>
                <div className={"mainContente"} style={{marginTop: 40}}>
                  <VideoList videos={videos} onButton1={handleAprove} onButton2={handleRefuse} button1Text="✅ Aprove" button2Text="❌ Refuse" />
                        </div>
              </div>
            
          ) : (
            <div className={styles.errorContainer}>
              <div className={styles.errorTitle}>You do not have access to this page.</div>
              {!isloggedin && (
                <Link href="/login?redirect=/adminpanel" className={styles.loginButton}>Login</Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}



