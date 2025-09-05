particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 100,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    // particles-config.js mein 'color' property dhundhein aur update karein:
"color": {
  "value": "#58a6ff" // Naya blue color jo theme se match karega
},
// line_linked mein bhi color badal dein:
"line_linked": {
  "enable": true,
  "distance": 150,
  "color": "#58a6ff", // Naya blue color
  "opacity": 0.4,
  "width": 1
},
    "shape": {
      "type": "circle",
    },
    "opacity": {
      "value": 0.5,
      "random": true,
    },
    "size": {
      "value": 3,
      "random": true,
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#00aaff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "repulse": {
        "distance": 100,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
    }
  },
  "retina_detect": true
});