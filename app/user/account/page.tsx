import { getChildren } from '@/actions/user';
import MyChild from '@/components/myChild';


const Account = async () => {
  const [children] = await Promise.all([
    getChildren()
  ]);

  return (
    <div className="container mx-auto py-10">
      <MyChild childList={children} />
    </div>
  );
};

export default Account;
