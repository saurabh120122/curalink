import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Get all Communities ---
const getCommunities = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('communities').select('*');
  if (error) throw new ApiError(500, error.message);
  return res.status(200).json(new ApiResponse(200, data, 'Communities fetched.'));
});

// --- Create a Community (Researcher) ---
const createCommunity = asyncHandler(async (req, res) => {
  const { name, description, slug } = req.body;
  const creator_id = req.user.id;

  if (!name || !slug) throw new ApiError(400, 'Name and slug are required.');

  const { data, error } = await supabase
    .from('communities')
    .insert({ name, description, slug, creator_id })
    .select()
    .single();
    
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new ApiError(409, 'This slug (URL) is already taken.');
    }
    throw new ApiError(500, error.message);
  }
  return res.status(201).json(new ApiResponse(201, data, 'Community created.'));
});

// --- Get Posts in a Community ---
const getPosts = asyncHandler(async (req, res) => {
  const { communitySlug } = req.params;
  
  // Find community ID from slug
  const { data: community, error: commError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', communitySlug)
    .single();
    
  if (commError || !community) throw new ApiError(404, 'Community not found.');

  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, full_name)')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, error.message);
  return res.status(200).json(new ApiResponse(200, data, 'Posts fetched.'));
});

// --- Create a Post (Patient) ---
const createPost = asyncHandler(async (req, res) => {
  const { communitySlug } = req.params;
  const { title, content } = req.body;
  const author_id = req.user.id;

  if (!title) throw new ApiError(400, 'Title is required.');

  // Find community ID from slug
  const { data: community, error: commError } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', communitySlug)
    .single();
  if (commError || !community) throw new ApiError(404, 'Community not found.');

  const { data, error } = await supabase
    .from('posts')
    .insert({ author_id, community_id: community.id, title, content })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  return res.status(201).json(new ApiResponse(201, data, 'Post created.'));
});

// --- Get a Single Post and its Replies ---
const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // Get post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, author:profiles(id, full_name), community:communities(name, slug)')
    .eq('id', postId)
    .single();
  if (postError || !post) throw new ApiError(404, 'Post not found.');

  // Get replies
  const { data: replies, error: repliesError } = await supabase
    .from('replies')
    .select('*, author:profiles(id, full_name, role)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
    
  if (repliesError) throw new ApiError(500, repliesError.message);

  const responseData = { ...post, replies: replies || [] };
  return res.status(200).json(new ApiResponse(200, responseData, 'Post fetched.'));
});

// --- Create a Reply (Researcher) ---
const createReply = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const author_id = req.user.id;

  if (!content) throw new ApiError(400, 'Content is required.');

  const { data, error } = await supabase
    .from('replies')
    .insert({ author_id, post_id: postId, content })
    .select('*, author:profiles(id, full_name, role)') // Return new reply with author
    .single();
    
  if (error) throw new ApiError(500, error.message);
  return res.status(201).json(new ApiResponse(201, data, 'Reply posted.'));
});

export {
  getCommunities,
  createCommunity,
  getPosts,
  createPost,
  getPostById,
  createReply,
};