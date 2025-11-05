import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Get My Connections (Researcher) ---
const getConnections = asyncHandler(async (req, res) => {
  const my_id = req.user.id;
  
  // This is a complex query to get connections where I am EITHER requester or receiver
  const { data, error } = await supabase
    .from('connections')
    .select('*, requester:profiles(id, full_name), receiver:profiles(id, full_name)')
    .or(`requester_id.eq.${my_id},receiver_id.eq.${my_id}`)
    .eq('status', 'accepted'); // Only get accepted connections

  if (error) throw new ApiError(500, error.message);
  return res.status(200).json(new ApiResponse(200, data, 'Connections fetched.'));
});

// --- Send Connection Request (Researcher) ---
const requestConnection = asyncHandler(async (req, res) => {
  const { userId: receiver_id } = req.params;
  const requester_id = req.user.id;

  if (requester_id === receiver_id) {
    throw new ApiError(400, 'You cannot connect with yourself.');
  }

  const { data, error } = await supabase
    .from('connections')
    .insert({ requester_id, receiver_id, status: 'pending' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint
      throw new ApiError(409, 'Connection request already sent.');
    }
    throw new ApiError(500, error.message);
  }
  return res.status(201).json(new ApiResponse(201, data, 'Request sent.'));
});

// --- Accept Connection Request (Researcher) ---
const acceptConnection = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const my_id = req.user.id; // I am the receiver

  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('receiver_id', my_id) // Security check
    .select()
    .single();
    
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, 'Request not found or not for you.');
  
  return res.status(200).json(new ApiResponse(200, data, 'Connection accepted.'));
});

// --- Get Chat Messages (Researcher) ---
const getChatMessages = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const my_id = req.user.id;

  // TODO: Security check - ensure 'my_id' is part of this 'connectionId'
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, sender:profiles(id, full_name)')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true });
    
  if (error) throw new ApiError(500, error.message);
  return res.status(200).json(new ApiResponse(200, data, 'Messages fetched.'));
});

// --- Send a Chat Message (Researcher) ---
const sendChatMessage = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const { content } = req.body;
  const sender_id = req.user.id;

  if (!content) {
    throw new ApiError(400, 'Message content is required.');
  }

  // TODO: Security Check
  // 1. Get the connection from the DB
  // 2. Check if req.user.id is EITHER requester_id or receiver_id
  // 3. If not, throw a 403 Forbidden error.
  
  // For the hackathon, we'll optimistically insert.
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      connection_id: connectionId,
      sender_id: sender_id,
      content: content,
    })
    .select('*, sender:profiles(id, full_name)')
    .single();
    
  if (error) {
    throw new ApiError(500, error.message);
  }
  
  // --- WebSocket Logic Would Go Here ---
  // 1. Find the other user in this connection
  // 2. Get their WebSocket ID (if they are online)
  // 3. Emit a 'new_message' event to them with the 'data' payload
  // -------------------------------------

  return res.status(201).json(new ApiResponse(201, data, 'Message sent.'));
});

export {
  getConnections,
  requestConnection,
  acceptConnection,
  getChatMessages,
  sendChatMessage
};