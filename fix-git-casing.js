const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const sectionsDir = 'components/sections';
const files = [
    'AboutSection.tsx',
    'CTASection.tsx',
    'ContactSection.tsx',
    'FAQSection.tsx',
    'FeaturesSection.tsx',
    'FooterSection.tsx',
    'HeroSection.tsx',
    'MentoriaPackagesSection.tsx',
    'ServiceSection.tsx',
    'TestimonialSection.tsx',
    'TestimonialsSection.tsx'
];

console.log('--- Standardizing Git Casing ---');

files.forEach(file => {
    const filePath = path.join(sectionsDir, file);
    const tempPath = path.join(sectionsDir, `temp_${file}`);

    try {
        // If it exists in git, rename it to temp then back to force casing update
        execSync(`git mv "${filePath}" "${tempPath}"`, { stdio: 'ignore' });
        execSync(`git mv "${tempPath}" "${filePath}"`, { stdio: 'ignore' });
        console.log(`Updated casing for ${file}`);
    } catch (e) {
        console.log(`Skipping ${file} - not in git or other error`);
        // If not in git, check if it's on disk and add it correctly
        if (fs.existsSync(filePath)) {
            try {
                execSync(`git add "${filePath}"`);
                console.log(`Added ${file} to git`);
            } catch (addErr) {
                console.log(`Failed to add ${file}: ${addErr.message}`);
            }
        }
    }
});

console.log('--- Done ---');
