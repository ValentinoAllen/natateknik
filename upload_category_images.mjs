import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vuxnsqyeobtxfynuvcyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eG5zcXllb2J0eGZ5bnV2Y3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDM0ODAsImV4cCI6MjA4NzY3OTQ4MH0.vL8OmoLAmgo_a5chnkCbS_DY-JYiYbYy8PZANUA38fc';
const supabase = createClient(supabaseUrl, supabaseKey);

const srcDir = 'f:/NataTeknikFigma/public/categories';

// Rename files to clean names and map to category IDs
const categoryImages = [
    { id: 2, name: 'POWERTOOLS', oldFile: 'cat_powertools_1772688763140.png', newFile: 'powertools.png' },
    { id: 6, name: 'HAND TOOLS', oldFile: 'cat_hand_tools_1772688786471.png', newFile: 'hand-tools.png' },
    { id: 9, name: 'GENERATOR', oldFile: 'cat_generator_1772688800144.png', newFile: 'generator.png' },
    { id: 10, name: 'GENERATOR', oldFile: 'cat_generator_1772688800144.png', newFile: 'generator.png' },
    { id: 3, name: 'KOMPRESOR', oldFile: 'cat_kompresor_1772688867553.png', newFile: 'kompresor.png' },
    { id: 4, name: 'POMPA AIR', oldFile: 'cat_pompa_air_1772688883896.png', newFile: 'pompa-air.png' },
    { id: 5, name: 'WELDING EQUIPMENT', oldFile: 'cat_welding_1772688897377.png', newFile: 'welding.png' },
    { id: 15, name: 'BEARING', oldFile: 'cat_bearing_1772688966434.png', newFile: 'bearing.png' },
    { id: 7, name: 'LIFTING EQUIPMENT', oldFile: 'cat_lifting_1772688980000.png', newFile: 'lifting.png' },
    { id: 8, name: 'MACHINERY', oldFile: 'cat_machinery_1772688990511.png', newFile: 'machinery.png' },
    { id: 12, name: 'SAFETY EQUIPMENT', oldFile: 'cat_safety_1772689059489.png', newFile: 'safety.png' },
    { id: 13, name: 'SPAREPART', oldFile: 'cat_sparepart_1772689081139.png', newFile: 'sparepart.png' },
    { id: 14, name: 'V-BELT', oldFile: 'cat_vbelt_1772689097272.png', newFile: 'vbelt.png' },
    { id: 11, name: 'AKSESORIS POWERTOOLS', oldFile: 'cat_aksesoris_1772689138010.png', newFile: 'aksesoris.png' },
];

async function run() {
    // Rename files
    const seen = new Set();
    for (const cat of categoryImages) {
        const oldPath = `${srcDir}/${cat.oldFile}`;
        const newPath = `${srcDir}/${cat.newFile}`;
        if (!seen.has(cat.newFile) && fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            seen.add(cat.newFile);
            console.log(`Renamed: ${cat.oldFile} -> ${cat.newFile}`);
        }
    }

    // Update DB records with path
    for (const cat of categoryImages) {
        const imageUrl = `/categories/${cat.newFile}`;
        const { error } = await supabase
            .from('categories')
            .update({ image: imageUrl })
            .eq('id', cat.id);

        if (error) {
            console.error(`DB error for ${cat.name}:`, error.message);
        } else {
            console.log(`OK ${cat.name} (id:${cat.id}) => ${imageUrl}`);
        }
    }

    console.log('\nDone!');
}

run();
