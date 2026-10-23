-- Vider toutes les tables concernées et réinitialiser les séquences
TRUNCATE TABLE lots, product_photos, producers, Products, product_types, unites, users, addresses RESTART IDENTITY CASCADE;

-- Insertion d'une adresse
INSERT INTO addresses (street, number, mailbox, postalcode, city, country)
VALUES ('Main Street', '123', 'Apt 4B', '10001', 'Bruxelles', 'Belgique');

-- Insertion d'utilisateurs
INSERT INTO users (email, firstname, lastname, password, phonenumber, creation_date, id_address, civility, creator_id, role)
VALUES
    ('ashutosh@gmail.com', 'Ashu', 'ManShrestha', '$2y$10$EW75BdcbCfKEA3NbE7in4OiYYacfP3OY4Q2JsVzjxd3jNxxgAEZNu', '0000000000', '2012-12-12T00:00:00', (SELECT id FROM addresses WHERE street = 'Main Street' AND number = '123'), 'Monsieur', NULL, 'CLIENT'),
    ('gestionnaire@gmail.com', 'Admin', 'Strator', '$2a$10$n9EodUx55xK.nW0cxDvL8Oo9pVoZs9jx59sVvd/co4tKOKfWSajNG', '0000000000', '2012-12-12T00:00:00', (SELECT id FROM addresses WHERE street = 'Main Street' AND number = '123'), 'Monsieur', NULL, 'GESTIONNAIRE'),
    ('producteur@gmail.com', 'Admin', 'Strator', '$2a$10$n9EodUx55xK.nW0cxDvL8Oo9pVoZs9jx59sVvd/co4tKOKfWSajNG', '0000000000', '2012-12-12T00:00:00', (SELECT id FROM addresses WHERE street = 'Main Street' AND number = '123'), 'Monsieur', NULL, 'PRODUCTEUR'),
    ('benevole@gmail.com', 'Admin', 'Strator', '$2a$10$n9EodUx55xK.nW0cxDvL8Oo9pVoZs9jx59sVvd/co4tKOKfWSajNG', '0000000000', '2012-12-12T00:00:00', (SELECT id FROM addresses WHERE street = 'Main Street' AND number = '123'), 'Monsieur', NULL, 'BÉNÉVOLE'),
    ('user.test@gmail.com', 'Bilal', 'ManShrestha', '$2a$10$XURP2XURP2XURP2XURP2XURP2XURP2XURP2XURP2XURP2XURP2XUR', '0000000000', '2012-12-12T00:00:00', (SELECT id FROM addresses WHERE street = 'Main Street' AND number = '123'), 'Monsieur', NULL, 'CLIENT'),
    ('client@gmail.com', 'Admin', 'Strator', '$2a$10$n9EodUx55xK.nW0cxDvL8Oo9pVoZs9jx59sVvd/co4tKOKfWSajNG', '0000000000', '2012-12-12T00:00:00', (SELECT id FROM addresses WHERE street = 'Main Street' AND number = '123'), 'Monsieur', NULL, 'CLIENT')

ON CONFLICT (email) DO NOTHING;

-- Insertion des unités
INSERT INTO unites (unite)
VALUES ('Kg'), ('Litre'), ('Pièce'), ('Bouteille'), ('Paquet'), ('Autre')
ON CONFLICT (unite) DO NOTHING;

-- Insertion des types de produits
INSERT INTO product_types (libelle_type)
VALUES ('Légumes'), ('Fruits'), ('Produits laitiers'), ('Boulangerie'), ('Viande'), ('Boissons'), ('Autres')
ON CONFLICT (libelle_type) DO NOTHING;

-- Insertion des produits
INSERT INTO Products (description, libelle_product, type_produit, id_unite)
VALUES ('Fraise fraîche de saison', 'fraise', (SELECT id FROM product_types WHERE libelle_type = 'Fruits'), (SELECT id FROM unites WHERE unite = 'Kg')),
       ('Pomme golden pour le client', 'pomme golden', (SELECT id FROM product_types WHERE libelle_type = 'Fruits'), (SELECT id FROM unites WHERE unite = 'Kg')),
       ('chou-fleur cheddar', 'chou-fleur', (SELECT id FROM product_types WHERE libelle_type = 'Légumes'), (SELECT id FROM unites WHERE unite = 'Litre')),
       ('pomme rouge', 'pomme rouge', (SELECT id FROM product_types WHERE libelle_type = 'Fruits'), (SELECT id FROM unites WHERE unite = 'Kg'));



-- Insertion des producteurs
INSERT INTO producers (user_id, company_name, email)
VALUES ((SELECT id FROM users WHERE email = 'ashutosh@gmail.com'), 'Producteur Bio', 'producer@example.com'),
       ((SELECT id FROM users WHERE email = 'producteur@gmail.com'), 'produceuteur', 'Producteur@gmail.com')
ON CONFLICT (user_id) DO NOTHING;

-- Insertion des photos de produits
INSERT INTO product_photos (product, url)
VALUES ((SELECT id FROM Products WHERE libelle_product = 'fraise'), 'https://imagestorage023.blob.core.windows.net/dev/4abc08af-0749-4e83-80c1-2a115e1a3b68'),
       ((SELECT id FROM Products WHERE libelle_product = 'pomme golden'), 'https://imagestorage023.blob.core.windows.net/dev/ace4ac5a-c542-4ddd-ae5c-1e17aca414db'),
       ((SELECT id FROM Products WHERE libelle_product = 'chou-fleur'), 'https://imagestorage023.blob.core.windows.net/dev/e9602e09-b689-403b-a060-7ea6f86517d0');

-- Insertion des lots
INSERT INTO lots (price, initial_quantity, sold_quantity, reserved_quantity, remaining_quantity, withdrawn_quantity, lot_status, available_date, proposal_date, reception_date, responsible, product, producer, photo)
VALUES
    (100.0, 50, 10, 5, 35, 0, 'en vente', '2025-03-01', '2025-02-15', NULL,
     (SELECT id FROM users WHERE email = 'ashutosh@gmail.com'),
     (SELECT id FROM Products WHERE libelle_product = 'fraise'),
     (SELECT user_id FROM producers WHERE email = 'producer@example.com'),
     (SELECT id_photo FROM product_photos WHERE url = 'https://imagestorage023.blob.core.windows.net/dev/4abc08af-0749-4e83-80c1-2a115e1a3b68')),
    (5.0, 150, 70, 0, 80, 0, 'en vente', '2025-04-05', '2025-03-31', NULL,
     (SELECT id FROM users WHERE email = 'ashutosh@gmail.com'),
     (SELECT id FROM Products WHERE libelle_product = 'pomme golden'),
     (SELECT user_id FROM producers WHERE email = 'producer@example.com'),
     (SELECT id_photo FROM product_photos WHERE url = 'https://imagestorage023.blob.core.windows.net/dev/ace4ac5a-c542-4ddd-ae5c-1e17aca414db')),
    (7.0, 150, 70, 0, 80, 0, 'en vente', '2025-04-05', '2025-03-31', NULL,
     (SELECT id FROM users WHERE email = 'ashutosh@gmail.com'),
     (SELECT id FROM Products WHERE libelle_product = 'chou-fleur'),
     (SELECT user_id FROM producers WHERE email = 'producer@example.com'),
     (SELECT id_photo FROM product_photos WHERE url = 'https://imagestorage023.blob.core.windows.net/dev/e9602e09-b689-403b-a060-7ea6f86517d0')),
    (7.0, 150, 70, 0, 80, 0, 'en vente', '2025-04-05', '2025-03-31', NULL,
     (SELECT id FROM users WHERE email = 'ashutosh@gmail.com'),
     (SELECT id FROM Products WHERE libelle_product = 'pomme rouge'),
     (SELECT user_id FROM producers WHERE email = 'producer@example.com'),
     (SELECT id_photo FROM product_photos WHERE url = 'https://imagestorage023.blob.core.windows.net/dev/e9602e09-b689-403b-a060-7ea6f86517d0'));

-- Insertion d'une réservation pour client@gmail.com avec état "récupérée"
INSERT INTO reservations (client_id, date_reservation, date_recuperation, etat_reservation)
VALUES (
           (SELECT id FROM users WHERE email = 'client@gmail.com'),
           '2025-04-15',
           '2025-04-20',
           'récupérée'
       );

-- Insertion d'un enregistrement dans reservation_lot_produits pour lier la réservation à un lot
INSERT INTO reservation_lots_produits (id_reservation, id_lot, quantite)
VALUES (
           (SELECT id_reservation FROM reservations WHERE client_id = (SELECT id FROM users WHERE email = 'client@gmail.com') AND etat_reservation = 'récupérée'),
           (SELECT id_lot FROM lots WHERE product = (SELECT id FROM Products WHERE libelle_product = 'fraise')),
           5
       );
