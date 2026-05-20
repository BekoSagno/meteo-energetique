Cahier des Charges : Projet Météo Énergétique (V1)
1. Objectif du Produit
Créer une application web progressive (PWA) d'intérêt public et professionnel, cartographiant en temps réel la disponibilité et la stabilité du courant électrique par secteur en Guinée, en combinant des sondes physiques (Kits IoT MQTT) et le signalement communautaire.

2. Architecture Générale des Modules (Spécifications Fonctionnelles)
Module 1 : L'Application Client (Frontend - React.js)
Ce module gère l'interface vécue par les citoyens et les professionnels depuis leur smartphone ou leur ordinateur.

Écran d'Accueil (Vue "SaaS" Épurée) :

Fonds blancs/gris ultra-clairs, typographie fine bleu marine.

Composant "Météo Locale" : Affiche le secteur par défaut de l'utilisateur avec une pastille d'état (🟢 Alimenté, 🔴 Coupure, 🟡 Instable).

Composant "Prédiction" : Affiche un compte à rebours ou une heure estimée de changement d'état basée sur les calculs du backend (ex: Retour estimé : ~2h 15m).

Composant "Statistiques" : Un mini-graphique épuré affichant le taux de disponibilité (en %) du secteur sur les 7 derniers jours.

Système de Signalement (Le bouton communautaire) :

Un bouton d'action discret et élégant.

Fenêtre contextuelle (Pop-up) simplifiée demandant une confirmation : « Confirmez-vous que votre secteur est dans le noir ? (Vérifiez que votre compteur prépayé est rechargé) ».

Mode PWA (Progressive Web App) :

Mise en cache des données pour permettre l'ouverture de l'application même sans connexion Internet (affichage du dernier état connu).

Module 2 : L'Ingestion IoT (Le Broker Mosquitto & l'Écouteur)
Ce module s'occupe de capter la vérité du terrain transmise par les boîtiers physiques.

Réseau MQTT : Configuration des sujets (Topics) structurés par région et secteur (ex: guinee/conakry/kipe2/status).

Script d'écoute (Worker Node.js) : Un script qui tourne en tâche de fond sur le serveur, connecté à Mosquitto, qui intercepte chaque message envoyé par les kits (JSON contenant le kit_id et le status ON/OFF) et le renvoie vers la logique de traitement.

Module 3 : Le Cœur Logique et API (Backend - Node.js & Express)
C'est le chef d'orchestre qui traite la donnée et prend les décisions.

API REST pour le Frontend : Routes sécurisées pour l'inscription/connexion par numéro de téléphone, la récupération de la météo des secteurs et l'envoi des signalements usagers.

Algorithme de Consensus (Anti-erreur) : Logique qui valide un changement d'état uniquement si le Kit IoT change de statut, OU si un volume critique d'usagers (ex: minimum 3 usagers distincts dans un rayon de 5 minutes) signale la même anomalie.

Algorithme de Prédiction V1 : Calcul de la moyenne mobile des durées de coupure historiques pour le même jour de la semaine et la même tranche horaire afin de générer l'estimation de retour.

Module 4 : La Base de Données Spatiale (PostgreSQL + PostGIS)
Le réservoir qui structure et mémorise tout.

Stockage des coordonnées des secteurs sous forme de polygones géographiques (PostGIS).

Enregistrement chronologique (timestamps) de chaque coupure et retour pour alimenter l'historique de prédiction.

3. Spécifications Techniques & Contraintes
Performance cible : Chargement initial de l'application en moins de 1.5 seconde sur un réseau 3G.

Poids de l'UI : Interdiction d'utiliser des images matricielles (.png, .jpg). Utilisation exclusive de styles CSS (Tailwind) et d'icônes vectorielles (.svg).

Sécurité : Limitation du nombre de requêtes (Rate-limiting) sur les routes de signalement pour éviter le spam de la base de données.

🗺️ Plan d'Action pour l'Équipe (Le Rétroplanning)
Pour ne pas s'emmêler les pinceaux avec Cursor, nous allons procéder par jalons stricts. Chaque étape doit être validée avant de passer à la suivante.

[Étape 1 : Base de Données] ──► [Étape 2 : Backend & MQTT] ──► [Étape 3 : Frontend & UI]
Étape 1 : Fondations (La Base de Données PostgreSQL + PostGIS)
Votre rôle : Configurer l'instance PostgreSQL locale ou cloud et activer PostGIS.

Mon rôle : Vous fournir le script SQL parfait et complet (tables, clés étrangères, index géographiques).

Le rôle de Cursor : Exécuter le script, vérifier les connexions et générer les premiers modèles d'accès aux données.

Étape 2 : Le Moteur (Le Backend Node.js & la connexion Mosquitto)
Votre rôle : Initialiser le projet Node.js.

Mon rôle : Structurer l'architecture des dossiers du serveur, écrire la logique d'écoute MQTT et les algorithmes de consensus.

Le rôle de Cursor : Écrire les fichiers de routes d'API, configurer les contrôleurs et automatiser les tests de réception des messages des kits.

Étape 3 : L'Interface Visuelle (Le Frontend React.js + Tailwind CSS)
Votre rôle : Créer l'application React avec votre outil habituel.

Mon rôle : Vous donner la structure des composants en appliquant scrupuleusement la charte épurée et claire (style Hello Energy).

Le rôle de Cursor : Intégrer les classes Tailwind CSS, coder les graphiques de statistiques et connecter les boutons de signalement aux API créées à l'étape 2