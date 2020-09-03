export const getMySQLNameString = (schemaName: string, itemName: string) =>
  `\`${schemaName}\`.\`${itemName}\``;
