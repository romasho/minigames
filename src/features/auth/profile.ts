export interface Profile {
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export function profileName(profile: Profile): string {
  const localPart: string = profile.email.split('@', 1)[0] ?? '';
  return profile.displayName.trim() || localPart || 'Player';
}

export function profileInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (word: string): string =>
          /[\p{L}\p{N}]/u.exec(word)?.[0]?.toUpperCase() ?? '',
      )
      .join('') || '?'
  );
}

export function commentAuthor(profile: Profile): string {
  const name: string = profileName(profile);
  return name.length >= 2 ? name.slice(0, 30) : 'Player';
}
