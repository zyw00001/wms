import EnhanceLoading from './Loading';
import EnhanceDialogs from './Dialogs';

const EnhanceEditDialog = (Container, EditDialog) => {
  return EnhanceDialogs(Container, ['edit'], [EditDialog]);
};

export {EnhanceLoading, EnhanceDialogs, EnhanceEditDialog};
