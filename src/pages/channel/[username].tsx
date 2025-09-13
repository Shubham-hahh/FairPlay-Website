"use client"

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import type { Video, ProfileData } from '@/types'
import { Topbar } from '@/components/ui/Topbar/Topbar'
import { Sidebar } from '@/components/ui/Sidebar/Sidebar'
import styles from './ChanelPage.module.css'
import { useToast } from '@/components/ui/Toast/Toast';
import VideoList from '@/components/mychannel/VideoList';
import Image from 'next/image'

export default function chanelPage() {
    const router = useRouter()
    const { username } = router.query
    const [videos, setVideos] = useState<Video[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();
    const [userID, setuserId]=useState<string>("");  
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [BannerURL, setBannerURL] = useState<string>("https://placehold.co/1200x250/557CD9/FFFFFF?text=Banner");
    const [loadingProfile, setLoadingProfile]= useState(false)
    const [profile, setProfile] = useState<ProfileData | null>(null);


   const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, bannerURL')
      .eq('id', userID)
      .single();

    if (error) {
      toastError('Unable to load profile.');
      setLoadingProfile(false);
      return;
    }
    if (profileData.bannerURL) {
      setBannerURL(profileData.bannerURL);
    }
    setProfile({ username: profileData.username, avatar_url: profileData.avatar_url });
    setAvatarPreview(profileData.avatar_url);
    setLoadingProfile(false);
  }, [ toastError, userID]);

    

    useEffect(() => {
      console.log("use effect");
      if (!username) return
        const getUserId = async () => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            
            .single();

          if (userError || !userData) {
            setError("Error when getting user ID");
            return;
          }
          if (userData)
          setuserId(userData.id);
          
          
        };

        getUserId();
        
       
        
      }, [ username, userID ]);

useEffect(()=>{ 
  if (!userID) return
  fetchProfile();
  const fetchVideos = async () => {
            console.log("username fetche video", username);
            setLoadingVideos(true);
            const userId=userID
        
            const { data: vids, error } = await supabase
              .from('videos')
              .select('*')
              .eq('user_id', userId)
              .eq('is_verified', true)
              .order('created_at', { ascending: false });
        
            if (error) {
                toastError('Error loading videos.');
                console.log("Error", error )
                setLoadingVideos(false);
              return;
            }
        
            setVideos(vids || []);
            setLoadingVideos(false);
          };
        fetchVideos();
        
      }, [userID])
 
    return (    
        <div className={styles.container}>
            <Topbar />
            <div className="page-wrapper container">    
                <Sidebar active="channel"/>
                <main className="main-content">
                  <div className={styles.channelHeader}>
                  <Image
                    src={avatarPreview || profile?.avatar_url || "/default-avatar.png"}
                    alt={`${profile?.username} avatar`}
                    width={140}
                    height={140}
                    style={{ borderRadius: '50%' }}
                    priority
                  />
                  <div>
                    <h2>{profile?.username}</h2>
                    
                  </div>
                </div>
                    <h1>Videos</h1>
                    {loadingVideos ? (  
                        <p>Loading videos...</p>
                    ) : error ? (
                        <p className={styles.error}>Error: {error}</p>
                    ) : videos.length === 0 ? (
                        <p>No videos found.</p>
                    ) : (
                        <VideoList videos={videos} onButton1={()=>{return}} onButton2={()=>{return}} button1Text='' button2Text=''/>
                        )}
                </main>
            </div>
        </div>
    )
}