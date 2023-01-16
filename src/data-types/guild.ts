export interface DatabaseGuild {
  id: string;
  isBotAuthorAllowed: boolean;

  // Patreon info
  userId?: string;
  activePatreon?: boolean;
  patreonTier?: number;
}
