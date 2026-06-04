import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Use a valid-but-dummy URL as fallback so createClient doesn't throw at build time.
// All actual queries will fail and be caught by the try/catch in each page.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : FALLBACK_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : FALLBACK_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type Member = {
  id: string;
  name_rp: string;
  rank: string;
  server: 'samp' | 'fivem' | 'both';
  bio: string | null;
  photo_url: string | null;
  image_position?: string;
  joined_at: string;
  is_active: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  server: 'samp' | 'fivem' | 'both';
  cover_image_url: string | null;
  author: string;
  published_at: string;
  is_published: boolean;
};

export type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  server: 'samp' | 'fivem' | 'both';
  uploaded_at: string;
};

export type SiteSettings = {
  about_story_title: string;
  about_story_desc: string;
  about_samp_title: string;
  about_samp_content: string;
  about_fivem_title: string;
  about_fivem_content: string;
  discord_samp: string;
  tiktok_samp: string;
  youtube_samp: string;
  instagram_samp: string;
  discord_fivem: string;
  tiktok_fivem: string;
  youtube_fivem: string;
  instagram_fivem: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  about_story_title: 'Dari Jalanan London ke Dunia Roleplay',
  about_story_desc: 'Hollow lahir dari hasrat sekelompok pemain roleplay yang ingin menghadirkan pengalaman gang UK yang autentik di dunia GTA. Terinspirasi dari kultur jalanan London — drill music, grime culture, dan dinamika gang block — kami membangun komunitas yang lebih dari sekedar game.',
  about_samp_title: 'Lore & Sejarah di GTA SA:MP',
  about_samp_content: 'Di platform GTA SA:MP, komunitas kami dikenal luas dengan nama The Hollow Block (THB). Faksi ini dirintis untuk menghidupkan kembali kultur gang jalanan UK dengan detail mekanis khas server SA:MP. Fokus utama kami di platform ini adalah koordinasi taktis, perang wilayah (turf war), serta perekonomian hitam yang ketat.\n\nSejarah membuktikan sejak 2019 THB mendominasi block timur.',
  about_fivem_title: 'Lore & Sejarah di GTA FiveM',
  about_fivem_content: 'Di platform GTA FiveM yang modern dan realistis, kami membawa identitas The Hollow Northenwall (THN). Di sini, kami memprioritaskan kualitas roleplay yang mendalam (deep roleplay), interaksi karakter yang kompleks, serta pemanfaatan kostum kustom (MLO/clothing) untuk merepresentasikan budaya UK Drill modern secara nyata.',
  discord_samp: 'https://discord.gg/xPPgZYxp',
  tiktok_samp: 'https://www.tiktok.com/@hollow.samp?_r=1&_t=ZS-96kvkUfX2oR',
  youtube_samp: 'https://youtube.com/@hollowsamp?si=QENhCHw3BT79xs6c',
  instagram_samp: '',
  discord_fivem: 'https://discord.gg/x5NCxdC52',
  tiktok_fivem: '',
  youtube_fivem: '',
  instagram_fivem: '',
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error || !data || data.length === 0) return DEFAULT_SETTINGS;
    
    const settings = { ...DEFAULT_SETTINGS };
    data.forEach((item: { key: string; value: string }) => {
      if (item.key in settings) {
        (settings as Record<string, string>)[item.key] = item.value;
      }
    });
    return settings;
  } catch (err) {
    console.error('Error fetching settings:', err);
    return DEFAULT_SETTINGS;
  }
}
