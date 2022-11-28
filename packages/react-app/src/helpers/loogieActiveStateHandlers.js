const handleTokenState = number => {
  if (number === 0) {
    return "Default";
  } else if (number === 1) {
    return "Slapped";
  } else if (number === 2) {
    return "Winner";
  } else if (number === 3) {
    return "Dead";
  }
};
const handleTokenVibe = number => {
  if (number === 0) {
    return "Chill";
  } else if (number === 1) {
    return "Lust";
  } else if (number === 2) {
    return "Rage";
  } else if (number === 3) {
    return "Immune";
  }
};

export default {handleTokenState, handleTokenVibe}