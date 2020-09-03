export const getMySQLNameString = (schemaName: string, itemName: string) =>
  `\`${schemaName}\`.\`${itemName}\``;

export const escapeText = (text: string | null) => {
  if (!text) {
    return 'NULL';
  }
  return `'%string "${text}" %'`;
};
