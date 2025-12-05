export function getImages(type) {
  let imageArray = [];
  switch (type) {
    case 1:
      for (let i = 1; i <= 4; i++) {
        imageArray.push(`../public/assets/skulls/s_still_normal_${i}.svg`);
      }
      break;
    case 2:
      for (let i = 1; i <= 4; i++) {
        imageArray.push(`../public/assets/skulls/s_still_fire_${i}.svg`);
      }
      break;
    case 3:
      for (let i = 1; i <= 4; i++) {
        imageArray.push(`../public/assets/skulls/s_move_normal_${i}.svg`);
      }
      break;
    case 4:
      for (let i = 1; i <= 4; i++) {
        imageArray.push(`../public/assets/skulls/s_move_fire_${i}.svg`);
      }
      break;
    default:
      break;
  }

  return imageArray;
}
