import type { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { supabase, type GalleryAlbum, type GalleryItem, type GalleryVideo } from '@/lib/supabase';
import AlbumDetailClient from './AlbumDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ albumId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { albumId } = await params;
  const { data } = await supabase.from('gallery_albums').select('title,description').eq('id', albumId).maybeSingle();
  return {
    title: data?.title ?? 'Album',
    description: data?.description ?? 'Koleksi foto dan video Hollow.',
  };
}

async function getAlbumData(albumId: string) {
  await connection();
  const [{ data: album }, { data: photos }, { data: videos }] = await Promise.all([
    supabase.from('gallery_albums').select('*').eq('id', albumId).maybeSingle(),
    supabase.from('gallery').select('*').eq('album_id', albumId).order('uploaded_at', { ascending: false }),
    supabase.from('gallery_videos').select('*').eq('album_id', albumId).order('created_at', { ascending: false }),
  ]);
  return { album, photos: photos ?? [], videos: videos ?? [] };
}

export default async function AlbumDetailPage({ params }: Props) {
  const { albumId } = await params;
  const { album, photos, videos } = await getAlbumData(albumId);

  if (!album) notFound();

  return (
    <AlbumDetailClient
      album={album as GalleryAlbum}
      photos={photos as GalleryItem[]}
      videos={videos as GalleryVideo[]}
    />
  );
}
