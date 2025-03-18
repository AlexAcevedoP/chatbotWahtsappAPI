import path from 'path';
import { google } from 'googleapis';

const sheets = google.sheets('v4');

async function addRowToSheet(auth, spreadsheetId, values){
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values]
        },
        auth,
    }
    
    try{
        const response = await sheets.spreadsheets.values.append(request);
        return response;

    }catch(error){
        console.log(error);
    }
}

const appendToSheet = async(data)=>{
    try{
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'credentials', 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        })
        const authClient = await auth.getClient();
        const spreadsheetId = '1rSRUw9YKLJxBO1C3Z0A3iy4MglJ6gHUtPXxNP_mtSEA';

        await addRowToSheet(authClient, spreadsheetId, data);
        return 'Datos correctamente guardados en la hoja de cálculo';

    }catch(error){
        console.log(error);
    }
}

export default appendToSheet;