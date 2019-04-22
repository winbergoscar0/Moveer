const USER_MOVING_SELF = 'You need to @mention a friend you want to move, not yourself! :)'
const MESSAGE_MISSING_MENTION = 'You need to @mention a friend!'
const USER_NOT_IN_ANY_VOICE_CHANNEL = 'You need to join a voice channel before moving people.'
const USER_INSIDE_MOVEER_VOICE_CHANNEL = "You can't move people into this voice channel."
const SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS = 'You seem to be having two channels called Moveer, please remove one!'
const SERVER_IS_MISSING_MOVEER_VOICE_CHANNEL = 'Hello, You need to create a voice channel named "Moveer"'
const SUPPORT_MESSAGE = 'Do you need support? Join us at the official discord and tag a moderator! https://discord.gg/8BXKe9g'
const MOVEER_MISSING_CONNECT_PERMISSION = "Hey! I'm not allowed to move people to this room. I won't join you but discord requires me to have CONNECT privileges to move people!"
const MOVEER_MISSING_MOVE_PERMISSION = "Hey! I'm not allowed to move people in this discord :/ Please kick me and reinvite me with 'Move Members' checked. Or double check that I have Move Members permissions in the room you're in!"
const MESSAGE_MISSING_ROOM_IDENTIFER = 'You need to write a number to identify a gMoveer room!'
const GROUP_MOVE_MESSAGE_CONTAINS_MENTIONS = "You're not supposed to @mention members with this command. Try !gmove <roomNumber> instead!"
const NO_VOICE_CHANNEL_NAMED_X = "There's no voice channel named "
const NO_USERS_INSIDE_ROOM = "There's no users inside the voice channel"
const CMOVE_OUTSIDE_MOVEERADMIN = 'This is an admin command, please use this inside the textchannel "moveeradmin"'
const CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER = 'You need to specify a voice channel!'
const USER_MENTION_NOT_IN_ANY_CHANNEL = 'is not inside any voice channel!'

module.exports = {
  USER_MOVING_SELF,
  MESSAGE_MISSING_MENTION,
  USER_NOT_IN_ANY_VOICE_CHANNEL,
  USER_INSIDE_MOVEER_VOICE_CHANNEL,
  SERVER_HAS_TWO_MOVEER_VOICE_CHANNELS,
  SERVER_IS_MISSING_MOVEER_VOICE_CHANNEL,
  SUPPORT_MESSAGE,
  MOVEER_MISSING_CONNECT_PERMISSION,
  MOVEER_MISSING_MOVE_PERMISSION,
  MESSAGE_MISSING_ROOM_IDENTIFER,
  GROUP_MOVE_MESSAGE_CONTAINS_MENTIONS,
  NO_VOICE_CHANNEL_NAMED_X,
  NO_USERS_INSIDE_ROOM,
  CMOVE_OUTSIDE_MOVEERADMIN,
  CMOVE_MESSAGE_MISSING_ROOM_IDENTIFER,
  USER_MENTION_NOT_IN_ANY_CHANNEL
};