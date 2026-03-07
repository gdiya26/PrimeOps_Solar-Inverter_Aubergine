// Map human-readable Blocks (A-F) to Supabase 'solar_tables' names
const blockToTableMap = {
    'A': 'Table 1', // Maps to plant 1, table 1
    'B': 'Table 2', // Maps to plant 1, table 2
    'C': 'Table 3', // Maps to plant 2, table 1
    'E': 'Table 5', // Maps to plant 3, table 1
    'F': 'Table 6'  // Maps to plant 3, table 2
};

const getTableFromBlock = (blockName) => {
    return blockToTableMap[blockName] || null;
};

const getAllBlocks = () => {
    return Object.keys(blockToTableMap);
};

const getAllowedTables = () => {
    return Object.values(blockToTableMap);
};

module.exports = {
    blockToTableMap,
    getTableFromBlock,
    getAllBlocks,
    getAllowedTables
};
