import { Profile } from '../../database/interfaces/database.interfaces';

export interface ActiveUser {
  id: string;
  email: string;
  role: string;
  profile?: Profile | null;
}
