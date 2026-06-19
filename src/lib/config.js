const cfg = {
  lat:          parseFloat(import.meta.env.VITE_LAT  || '30.5083'),
  lon:          parseFloat(import.meta.env.VITE_LON  || '-97.6789'),
  tz:           import.meta.env.VITE_TZ              || 'America/Chicago',
  googleKey:    import.meta.env.VITE_GOOGLE_API_KEY  || '',
  home:         import.meta.env.VITE_HOME_ADDRESS    || '',
  work:         import.meta.env.VITE_WORK_ADDRESS    || '',
  milburn:      import.meta.env.VITE_MILBURN_ADDRESS || 'Milburn Park, Austin, TX',
  downtown:     import.meta.env.VITE_DOWNTOWN_ADDRESS|| 'Congress Ave and 6th St, Austin, TX',
  trailforksRid:import.meta.env.VITE_TRAILFORKS_RID || '13077',
}

export default cfg
