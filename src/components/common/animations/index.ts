export const notificationAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 24,
  h: 24,
  nm: "Notification Bell",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Bell",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { 
          a: 1, 
          k: [
            { t: 0, s: [0], e: [15] },
            { t: 30, s: [15], e: [-15] },
            { t: 60, s: [-15], e: [0] }
          ]
        },
        p: { a: 0, k: [12, 12, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 20 },
              nm: "Bell Shape",
              s: { a: 0, k: [16, 16] }
            }
          ]
        }
      ]
    }
  ]
};

export const sunMoonToggleAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 24,
  h: 24,
  nm: "Sun Moon Toggle",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Toggle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { 
          a: 1, 
          k: [
            { t: 0, s: [0], e: [180] },
            { t: 30, s: [180], e: [360] }
          ]
        },
        p: { a: 0, k: [12, 12, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              p: { a: 0, k: [0, 0] },
              nm: "Circle",
              s: { a: 0, k: [16, 16] }
            }
          ]
        }
      ]
    }
  ]
}; 