import { ElMessage } from 'element-plus';
import sureIcon from '@/assets/images/sure.svg';

const getIconByType = (type) => {
  switch (type) {
    case 'success':
      return sureIcon;
    case 'warning':
      return warnIcon;
    default:
      return sureIcon;
  }
};

export const showMessage = (message, type = 'success', duration = 1000) => {
  const icon = getIconByType(type);
  ElMessage({
    grouping: true,
    duration,
    dangerouslyUseHTMLString: true,
    message: `<span class="custom-message"><img src="${icon}" class="warn-icon"/>${message}</span>`,
    customClass: 'custom-message-container',
    type,
  });
};
