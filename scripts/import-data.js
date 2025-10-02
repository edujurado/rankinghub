const fs = require('fs')
const csv = require('csv-parser')
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function importProviders() {
  const providers = []
  
  // Read CSV file
  fs.createReadStream('data/providers.csv')
    .pipe(csv())
    .on('data', (row) => {
      providers.push({
        name: row.name,
        category: row.category,
        position: parseInt(row.position),
        rating: parseFloat(row.rating),
        verified: row.verified === 'true',
        country: row.country,
        location: row.location,
        image_url: row.image_url,
        bio: row.bio,
        email: row.email,
        phone: row.phone,
        website: row.website || null,
        instagram: row.instagram || null
      })
    })
    .on('end', async () => {
      try {
        // Clear existing data
        await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('providers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        // Insert providers
        const { data: insertedProviders, error: providerError } = await supabase
          .from('providers')
          .insert(providers)
          .select()

        if (providerError) {
          console.error('Error inserting providers:', providerError)
          return
        }

        console.log(`Successfully imported ${insertedProviders.length} providers`)

        // Insert skills for each provider
        const skills = []
        for (const provider of insertedProviders) {
          skills.push({
            provider_id: provider.id,
            punctuality: parseInt(provider.punctuality) || 5,
            professionalism: parseInt(provider.professionalism) || 5,
            reliability: parseInt(provider.reliability) || 5,
            price: parseInt(provider.price) || 4,
            client_satisfaction: parseInt(provider.client_satisfaction) || 5
          })
        }

        const { error: skillsError } = await supabase
          .from('skills')
          .insert(skills)

        if (skillsError) {
          console.error('Error inserting skills:', skillsError)
          return
        }

        console.log(`Successfully imported skills for ${skills.length} providers`)
        console.log('Data import completed successfully!')
      } catch (error) {
        console.error('Error during import:', error)
      }
    })
}

// Run the import
importProviders()
