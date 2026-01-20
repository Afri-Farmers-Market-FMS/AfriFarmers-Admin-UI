const fs = require('fs');
const path = require('path');

const csvPath = 'c:\\Users\\PC\\AfriFarmers-Admin-UI\\List of Farmers onboarded on AFM e-commerce platform.csv';
const outPath = 'c:\\Users\\PC\\AfriFarmers-Admin-UI\\src\\services\\mockData.ts';

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/);
const headers = lines[0].split(',');

const farmers = [];

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Skip header
for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 5) continue; // Skip malformed lines

    // Mapping based on CSV structure observed
    // 0: , 1: No, 2: Name, 3: Ownership, 4: Date, 5: Province, 6: District, 
    // 7: Sector, 8: Cell, 9: Village, 10: OwnerName, 11: Phone, 12: TIN, 
    // 13: BusType, 14: PartType, 15: Desc, 16: Support, 17: Nationality, 
    // 18: NID, 19: Age, 20: Gender, 21: Edu, 22: Disability, 23: Size, 
    // 24: Revenue, 25: Income, 26: Employees, 27: Female, 28: Youth, 29: VC, 30: Perm

    const farmer = {
        id: parseInt(cols[1]) || i, // Fallback to index if No is weird
        businessName: cols[2]?.replace(/^"|"$/g, '') || 'Unnamed Business',
        ownership: cols[3] || 'Other',
        commencementDate: cols[4] || '',
        province: cols[5] || '',
        district: cols[6] || '',
        sector: cols[7] || '',
        cell: cols[8] || '',
        village: cols[9] || '',
        ownerName: cols[10] || '',
        phone: cols[11] || '',
        tin: cols[12] || 'None',
        businessType: cols[13] || '',
        participantType: cols[14] || '',
        companyDescription: cols[15]?.replace(/^"|"$/g, '') || '',
        supportReceived: cols[16]?.replace(/^"|"$/g, '') || '',
        nationality: cols[17] || 'Rwandan',
        nid: cols[18] || '',
        ownerAge: parseInt(cols[19]) || 0,
        gender: cols[20] || 'Unspecified',
        educationLevel: cols[21] || 'None',
        disabilityStatus: cols[22] || 'None',
        businessSize: cols[23] || 'Micro',
        revenue: cols[24]?.replace(/^"|"$/g, '') || 'Unknown',
        annualIncome: cols[25]?.replace(/^"|"$/g, '') || 'Unknown',
        employees: parseInt(cols[26]) || 0,
        femaleEmployees: parseInt(cols[27]) || 0,
        youthEmployees: parseInt(cols[28]) || 0,
        valueChain: cols[29]?.replace(/^"|"$/g, '') || '',
        permanentEmployees: (cols[30]?.toLowerCase().includes('yego') || cols[30]?.toLowerCase().includes('yes')) ? true : false,
        status: 'Active',
        crops: []
    };
    farmers.push(farmer);
}

const fileContent = `import { Farmer } from '../types';

export const initialFarmers: Farmer[] = ${JSON.stringify(farmers, null, 2)};
`;

fs.writeFileSync(outPath, fileContent);
console.log(`Successfully wrote ${farmers.length} farmers to ${outPath}`);
