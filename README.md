🥬 Terroir & Cie - Plateforme de Produits Locaux
Projet Académique 2024-2025 | Groupe n°23 - GreenBox

Ce projet vise à moderniser la coopérative Terroir & Cie en développant une plateforme web permettant la présentation des produits locaux et la gestion des réservations en ligne (Click & Collect).

👥 L'Équipe (GreenBox)
Ashutosh Man Shrestha
Yuhang Wu
Bilal Salhi 
Emir Emre

📝 Contexte du Projet
La coopérative belge Terroir & Cie vend des produits locaux (fruits, légumes, viandes) mais gérait ses ventes uniquement sur place. Afin d'améliorer l'expérience client et la visibilité des producteurs, cette solution numérique a été conçue pour :

Permettre la réservation en ligne des produits.
Gérer les stocks en temps réel.
Faciliter la mise en vente par les producteurs.
Alléger la charge de travail des bénévoles.
🚀 Fonctionnalités Principales
L'application est segmentée par rôles utilisateurs pour garantir une sécurité et une fluidité optimales.

🌍 Pour Tous (Visiteurs)
Consultation du catalogue produits avec filtres (nom, type).
Visualisation des détails des produits et horaires du magasin.
🛒 Pour les Clients
Compte personnel : Inscription et connexion sécurisée.
Réservation : Ajout de produits au panier (provenant de lots différents) et choix de la date de retrait.
Suivi : Historique des réservations (réservée, récupérée, annulée, abandonnée).
Annulation : Possibilité d'annuler une commande avant récupération.
👩‍🌾 Pour les Producteurs
Gestion des lots : Proposition de nouveaux lots de produits à la vente.
Suivi : Tableau de bord des lots en vente et vendus.
Notifications : Réception des validations ou refus des lots par les gestionnaires.
📦 Pour les Bénévoles (Magasin)
Gestion des retraits : Validation des commandes récupérées par les clients.
Gestion des stocks : Marquage des commandes non récupérées comme "Abandonnées" et retrait d'unités invendables.
📊 Pour les Gestionnaires (Administrateurs)
Administration : Création de comptes pour producteurs et gestionnaires.
Validation : Acceptation ou refus des lots proposés par les producteurs.
Tableau de bord : Statistiques des ventes par mois/année.
Paramétrage : Gestion des types de produits.
⚙️ Architecture et Données
Cycle de Vie d'une Réservation (Machine à états)
Le système gère rigoureusement l'état des commandes pour assurer la cohérence du stock :

Créée : Le client ajoute des articles au panier.
Réservée : Le client valide la commande (stock bloqué).
Récupérée : Le client vient chercher sa commande en magasin.
Annulée : Le client annule sa commande (remise en stock immédiate).
Abandonnée : Le client ne s'est pas présenté 30 min avant la fermeture (remise en stock automatique).
Modèle de Données (Résumé)
L'application repose sur une base de données relationnelle comprenant les entités principales suivantes :

Utilisateurs : Gestion des rôles (Client, Producteur, Gestionnaire, Bénévole).
Produits & Types : Catalogue de référence.
Lots_produits : Gestion des stocks apportés par les producteurs (avec statut de validation).
Réservations & Lignes : Commandes clients liées aux lots spécifiques.
🎨 Petit aperçu de l'Interface
L'interface a été pensée pour être fluide et intuitive :

<img width="2874" height="1446" alt="image" src="https://github.com/user-attachments/assets/b351ae64-5279-4653-903b-6f51436318b5" />
<img width="2874" height="1446" alt="image" src="https://github.com/user-attachments/assets/eb48997f-bf89-48fe-8e02-2a5f7cb72934" />
<img width="2718" height="1128" alt="image" src="https://github.com/user-attachments/assets/0bff13b7-9d28-4d80-b2ca-115063abb388" />
<img width="2762" height="1428" alt="image" src="https://github.com/user-attachments/assets/9e55faf4-699d-4677-82cc-7ec065c1d426" />
<img width="2854" height="1452" alt="image" src="https://github.com/user-attachments/assets/50353344-97ef-4ebd-b202-3dc444a8d21e" />
<img width="2528" height="1434" alt="image" src="https://github.com/user-attachments/assets/9d7407c6-13e5-48c7-816d-4b4a94b695fb" />
<img width="2788" height="1330" alt="image" src="https://github.com/user-attachments/assets/af5375fd-4d39-4942-a95a-d65d95fc6959" />
<img width="2788" height="1330" alt="image" src="https://github.com/user-attachments/assets/c7bd1411-232e-4fad-a370-015c5339224e" />
<img width="2862" height="1394" alt="image" src="https://github.com/user-attachments/assets/3bfc92fd-469c-45a1-bde0-a7ffcae80a52" />
<img width="2836" height="1572" alt="image" src="https://github.com/user-attachments/assets/659c12d6-e698-4dc4-b8cd-c75caab66aff" />


Ce projet a été réalisé dans le cadre du cours de conception d'applications d'etntreprise - 2024/2025.
