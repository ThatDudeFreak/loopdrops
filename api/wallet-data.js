// This is a Vercel serverless function that will fetch data from Google Sheets

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { wallet } = req.query;
    
    if (!wallet) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    try {
        // Fetch data from Google Sheets
        const data = await fetchFromGoogleSheets(wallet);
        
        if (!data) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function fetchFromGoogleSheets(wallet) {
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const API_KEY = process.env.GOOGLE_API_KEY;
    const SHEET_NAME = 'WalletData'; // Change this to your sheet name
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.values) {
            return null;
        }
        
        // Assuming the sheet has headers in the first row
        // Columns: Wallet, HypurrFi_P1_Points, HypurrFi_P1_Percent, HypurrFi_P2_Points, etc.
        const headers = data.values[0];
        const rows = data.values.slice(1);
        
        // Find the wallet
        const walletRow = rows.find(row => row[0]?.toLowerCase() === wallet.toLowerCase());
        
        if (!walletRow) {
            return null;
        }
        
        // Parse the row data based on your sheet structure
        return parseWalletData(headers, walletRow);
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        throw error;
    }
}

function parseWalletData(headers, row) {
    // This function should parse your specific sheet structure
    // Example structure:
    return {
        hypurrfi: {
            total: parseFloat(row[13]) || 0, // Assuming total is in column N
            phases: {
                1: {
                    points: parseFloat(row[1]) || 0,
                    percentage: parseFloat(row[2]) || 0
                },
                2: {
                    points: parseFloat(row[3]) || 0,
                    percentage: parseFloat(row[4]) || 0
                },
                3: {
                    points: parseFloat(row[5]) || 0,
                    percentage: parseFloat(row[6]) || 0
                }
            }
        },
        hyperlend: {
            total: parseFloat(row[14]) || 0, // Assuming total is in column O
            phases: {
                1: {
                    points: parseFloat(row[7]) || 0,
                    percentage: parseFloat(row[8]) || 0
                },
                2: {
                    points: parseFloat(row[9]) || 0,
                    percentage: parseFloat(row[10]) || 0
                },
                3: {
                    points: parseFloat(row[11]) || 0,
                    percentage: parseFloat(row[12]) || 0
                }
            }
        }
    };
}
