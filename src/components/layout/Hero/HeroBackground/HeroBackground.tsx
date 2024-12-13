function HeroBackground() {
  return (
    <div className="absolute inset-0">
        <div id="id-blury-bg" 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/assets/images/hero/blury_bg.webp')`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        <div id="bg-grid"
          className="absolute inset-0 mix-blend-soft-light opacity-30 z-10"
          style={{
            backgroundImage: `url('/assets/images/hero/bg-grid-hero-m.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50 z-20" />
      </div>
  )
}

export default HeroBackground