import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Video } from '@/types';
import { supabase } from '@/lib/supabase';
import { CategoryFilter } from '../CategoryFilter/CategoryFilter';
import styles from './VideoGridSection.module.css';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

interface VideoGridSectionProps {
  loading: boolean;
  error: string | null;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredVideos: Video[];
  parseISODuration: (iso: string) => string;
  parseThemes: (themes: string | string[]) => string[];
}

export function VideoGridSection({
  loading,
  error,
  categories,
  selectedCategory,
  setSelectedCategory,
  filteredVideos,
  parseISODuration,
  parseThemes,
}: VideoGridSectionProps) {
  const { t } = useTranslation('common');
  const [authorMap, setAuthorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMissingAuthors = async () => {
      const userIds = Array.from(
        new Set(filteredVideos.map((v: Video) => v.user_id).filter(Boolean) as string[])
      );
      if (userIds.length === 0) return;

      const missing = userIds.filter((id) => !authorMap[id]);
      if (missing.length === 0) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', missing);

        if (data) {
          setAuthorMap((prev) => {
            const copy = { ...prev };
            data.forEach((p) => {
              if (p.id) copy[p.id] = p.username || t('empty_username');
            });
            return copy;
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchMissingAuthors();
  }, [filteredVideos, authorMap, t]);

  return (
    <section className={styles.videoGridSection}>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        ariaLabel={t('scroll_categories')}
      />

      {loading ? (
        <p className={styles.videoMeta}>{t('loading')}</p>
      ) : error ? (
        <p className={`${styles.videoMeta} ${styles.videoError}`}>
          {t('error_prefix')} {error}
        </p>
      ) : (
        <div className={styles.videoGrid}>
          {filteredVideos.map((video) => {
            const authorId = video.user_id as string | undefined;
            const authorusername = authorId ? authorMap[authorId] : undefined;

            const originalRaw = video.duration;
            const normalized = normalizeDuration(originalRaw);
            let durationDisplay = t('no_videos_duration');

            if (video.type === 'youtube') {
              if (typeof normalized === 'string') {
                const fromProp = parseISODuration(normalized);
                durationDisplay =
                  fromProp && fromProp !== normalized
                    ? fromProp
                    : parseISODurationFallback(normalized, t);
              } else if (typeof normalized === 'number') {
                durationDisplay = formatSecondsToReadable(normalized);
              }
            } else {
              if (typeof normalized === 'string' && normalized.startsWith('P')) {
                const fromProp = parseISODuration(normalized);
                durationDisplay =
                  fromProp && fromProp !== normalized
                    ? fromProp
                    : parseISODurationFallback(normalized, t);
              } else if (typeof normalized === 'number') {
                durationDisplay = formatSecondsToReadable(normalized);
              }
            }

            return (
              <Link key={video.id} href={`/video/${video.id}`} legacyBehavior passHref>
                <a className={styles.videoCard}>
                  <div className={styles.videoThumbnailContainer}>
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        className={styles.videoThumbnail}
                        width={320}
                        height={180}
                      />
                    ) : video.type === 'youtube' && video.youtube_id ? (
                      <Image
                        src={`http://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                        alt={video.title}
                        className={styles.videoThumbnail}
                        width={320}
                        height={180}
                      />
                    ) : video.type === 'native' && video.url ? (
                      <video
                        src={video.url}
                        muted
                        className={styles.videoThumbnail}
                      />
                    ) : null}
                    {video.type === 'youtube' && video.youtube_id && (
                      <span className={styles.videoTypeTag}>YT</span>
                    )}
                    <span className={styles.videoDuration}>
                      {durationDisplay}
                    </span>
                  </div>
                  <div className={styles.videoContent}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <div className={styles.videoMetaInfo}>
                      <span className={styles.videoScore}>
                        {t('score_label')}
                        {video.quality_score != null
                          ? ` ${video.quality_score.toFixed(1)} / 5`
                          : t('n_a')}
                      </span>
                      <span className={styles.videoAuthor}>
                        {authorusername
                          ? `${t('by_prefix')} ${authorusername}`
                          : authorId
                          ? t('author_pending')
                          : t('author_unknown')}
                      </span>
                    </div>
                    <p className={styles.videoDescription}>
                      {video.description}
                    </p>
                    <div className={styles.videoTags}>
                      {parseThemes(video.themes ?? []).map(
                        (theme, index) => (
                          <span key={index} className={styles.tag}>
                            {theme}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatSecondsToReadable(sec: number): string {
  if (!isFinite(sec) || isNaN(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function normalizeDuration(raw: unknown): string | number | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    if (/^P/.test(trimmed)) return trimmed; // ISO 8601
    const asNum = Number(trimmed);
    if (!Number.isNaN(asNum) && isFinite(asNum)) return asNum;
    return null;
  }
  if (typeof raw === 'number' && isFinite(raw)) {
    return raw;
  }
  return null;
}

function parseISODurationFallback(iso: string, t: (key: string) => string): string {
  if (typeof iso !== 'string' || !iso.startsWith('P')) return t('no_videos_duration');
  const regex = /P(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const match = iso.match(regex);
  if (!match) return t('no_videos_duration');
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}
