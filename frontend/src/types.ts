interface Credentials {
  email: string;
  password: string;
}

interface User {
  id?: number;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  creationDate?: string;
  phonenumber: string;
  civility: string;
  address: Address;
  role: Role;
  creator?: User;
}

export type Role = 'GESTIONNAIRE' | 'PRODUCTEUR' | 'CLIENT' | 'BÉNÉVOLE';

interface AuthenticatedUser {
  id?: number;
  email: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  token: string;
  role: Role;
  address?: Address;
  creationDate?: string;
}

interface Address {
  street: string;
  postalcode: string;
  number: string;
  country: string;
  mailbox: string;
  city?: string;
}

interface NewManagerProducer {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  phonenumber: string;
  address: Address;
  civility: string;
  role: 'GESTIONNAIRE' | 'PRODUCTEUR';
  nomEntreprise?: string;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

interface ProductPhoto {
  id?: number;
  url?: string;
  description?: string;
  image?: File | undefined;
}

interface Product {
  id?: number;
  libelleProduct: string;
  description: string;
  unite: Unite;
  productType: ProductType;
}

interface Producer {
  userId?: number;
  companyName: string;
  email: string;
  user?: User;
}

interface ProductType {
  id?: number;
  libelleType: string;
}

interface Unite {
  id?: number;
  unite: string;
}

interface Lot {
  status: string;
  idLot?: number;
  price: number;
  initialQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  remainingQuantity: number;
  withdrawnQuantity: number;
  lotStatus: string;
  availableDate: string;
  proposalDate: string;
  receptionDate?: string;
  product: Product;
  photo?: ProductPhoto;
  producer: Producer;
}

interface Reservation {
  idReservation: number;
  client: User;
  dateReservation: string;
  dateRecuperation: string;
  etatReservation: string;
  reservationLotsProduits: ReservationLotProduit[];
}

interface ReservationLotProduit {
  idReservationLot?: number;
  reservationId?: Reservation;
  lot: Lot; // Champ principal contenant l'objet Lot complet
  lotId?: { idLot: number }; // Optionnel pour compatibilité avec la création de réservation
  quantite: number;
}

// Interface pour le contexte des réservations
interface ReservationContextType {
  reservations: Reservation[];
  fetchReservations: (clientId: number) => Promise<void>;
  createReservation: (
    clientId: number,
    pickupDate: string,
    items: ReservationLotProduit[],
  ) => Promise<void>;
  cancelReservation: (clientId: number, reservationId: number) => Promise<void>; // Added
}

// Interface pour le contexte des lots
interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (credential: Credentials, rememberMe: boolean) => Promise<void>;
  clearUser: () => void;
  updateUser?: (updatedUser: AuthenticatedUser) => Promise<void>;
}

interface LotContextType {
  availableLots: Lot[];
  pendingLots: Lot[]; // Ajouté
  error: string | null;
  loading: boolean;
  getLotById: (id: number) => Promise<Lot | null>;
  refetchLots: () => void;
  fetchPendingLots: () => Promise<Lot[]>; // Ajouté
  receiveLot: (idLot: number) => Promise<Lot | null>; // Ajouté
  acceptLot: (idLot: number) => Promise<Lot | null>; // Ajouté
  refuseLot: (idLot: number, refusalReason: string) => Promise<Lot | null>; // Ajouté
}

interface ProductContextType {
  addProduct: (newProduct: Product) => Promise<void>;
  fetchProducts: () => Promise<Product[]>;
  successMessage: string;
  setSuccessMessage: (message: string) => void;
}

export type {
  Address,
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  Credentials,
  Product,
  ProductType,
  Unite,
  ProductPhoto,
  Producer,
  Lot,
  LotContextType,
  ProductContextType,
  NewManagerProducer,
  Reservation,
  ReservationLotProduit,
  ReservationContextType,
};
