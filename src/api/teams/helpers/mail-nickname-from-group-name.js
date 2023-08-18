function mailNicknameFromGroupName(teamName) {
  // Remove non-ASCII characters
  const asciiOnly = teamName.replace(/[^\p{ASCII}]/gu, '')
  // Replace spaces
  const noSpaces = asciiOnly.trim().replace(/\s+/g, '_')
  // Replace any remaining disallowed characters
  const validCharacters = noSpaces.replace(/[@()[\]";:<>\\,]/g, '')
  // Limit to 64 characters
  return validCharacters.slice(0, 64)
}

export { mailNicknameFromGroupName }
