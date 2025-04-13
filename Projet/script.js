document.addEventListener("DOMContentLoaded", () => {
    const demain = new Date();
    demain.setDate(demain.getDate() + 2);
    const demainStr = demain.toISOString().split("T")[0];

    document.querySelectorAll(".date-debut, .date-fin").forEach(input => {
        input.setAttribute("min", demainStr);
    });
    const tarifs = {
        "RENAULT CLIO": 200,
        "RENAULT MEGANE": 50,
        "TOYOTA YARIS": 200,
        "OPEL ASTRA": 400,
        "BMW G30": 1500,
        "BMW G11" : 2000,
        "PEUGEOT 208": 200,
        "RENAULT EXPRESSE" : 350,
        "DACIA DOCKER" : 300,
        "FORD KUGA" : 600,
        "DACIA DUSTER" : 500,
        "DACIA STEPWAY":200
    };

    // Fonction de calcul de prix
    function calculerPrix(dateDebut, dateFin, modele) {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const duree = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)); // jours
        const prixJour = tarifs[modele.toUpperCase()] || 50; // par défaut
        return duree * prixJour;
    }

    // Affiche les réservations
    function afficherReservations() {
        const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
        const detailsContainer = document.getElementById("details");
        const compteur = document.getElementById("compteur");

        if (reservations.length === 0) {
            if (compteur) compteur.textContent = "0";
            if (detailsContainer) {
                detailsContainer.innerHTML = "<p class=hip >Aucune réservation trouvée.</p>";
            }
            return;
        }

        let total = 0;
        if (compteur) compteur.textContent = ` ${reservations.length}`;
        if (detailsContainer) detailsContainer.innerHTML = "";

        reservations.forEach((reservation, index) => {
            const prix = calculerPrix(reservation.dateDebut, reservation.dateFin, reservation.nom);
            total += prix;

            const voitureCard = document.createElement("div");
            voitureCard.classList.add("card");
            voitureCard.innerHTML = `
                <img src="images/${reservation.nom.toLowerCase()}.png" alt="${reservation.nom}">
                <h3>${reservation.nom}</h3>
                <p><strong>Du:</strong> ${reservation.dateDebut} <br> <strong>Au:</strong> ${reservation.dateFin}</p>
                <p><strong>Prix :</strong> ${prix} DH</p>
                <button onclick="annulerReservation(${index})">Annuler</button>
            `;
            detailsContainer.appendChild(voitureCard);
        });

        const totalElement = document.createElement("div");
        totalElement.classList.add("total");
        totalElement.innerHTML = `<h3 class=hip >Total général : ${total} DH</h3>`;
        detailsContainer.appendChild(totalElement);
    }

    // Annuler une réservation
    window.annulerReservation = function(index) {
        let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
        reservations.splice(index, 1);
        localStorage.setItem("reservations", JSON.stringify(reservations));
        afficherReservations();
    };

    // Réservation sur vehicules.html
    if (document.querySelector(".btn-reserver")) {
        const boutonsReserver = document.querySelectorAll(".btn-reserver");

        boutonsReserver.forEach(bouton => {
            bouton.addEventListener("click", () => {
                const voitureDiv = bouton.closest("div");
                const nomVoiture = voitureDiv.getAttribute("data-nom");
                const dateDebut = voitureDiv.querySelector(".date-debut").value;
                const dateFin = voitureDiv.querySelector(".date-fin").value;

                if (!dateDebut || !dateFin) {
                    alert("Veuillez sélectionner une date de début et de fin.");
                    return;
                }

                if (new Date(dateDebut) >= new Date(dateFin)) {
                    alert("La date de début doit être antérieure à la date de fin.");
                    return;
                }

                const reservationsConfirmees = JSON.parse(localStorage.getItem("reservationsConfirmees")) || {};
                const dejaReservees = reservationsConfirmees[nomVoiture] || [];

                const chevauche = dejaReservees.some(r =>
                    datesChevauchent(dateDebut, dateFin, r.dateDebut, r.dateFin)
                );

                if (chevauche) {
                    alert("Cette voiture est déjà réservée pour cette période. Veuillez choisir d'autres dates.");
                    return;
                }

                let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
                reservations.push({ nom: nomVoiture, dateDebut, dateFin });

                localStorage.setItem("reservations", JSON.stringify(reservations));
                window.location.href = "reservation.html";
            });
        });
    }

    // Pop-up de finalisation
    const boutonFinaliser = document.getElementById("finaliser");
    const popup = document.getElementById("popup");
    const boutonConfirmer = document.getElementById("confirmer");
    const boutonAnnuler = document.getElementById("annuler");

    if (boutonFinaliser) {
        boutonFinaliser.addEventListener("click", () => {
            popup.style.display = "block";
        });
    }

    if (boutonAnnuler) {
        boutonAnnuler.addEventListener("click", () => {
            popup.style.display = "none";
        });
    }

    if (boutonConfirmer) {
        boutonConfirmer.addEventListener("click", () => {
            const nom = document.getElementById("nom").value.trim();
            const prenom = document.getElementById("prenom").value.trim();
            const telephone = document.getElementById("telephone").value.trim();
            const email = document.getElementById("email").value.trim();
            const adresse = document.getElementById("adresse").value.trim();

            if (!nom || !prenom || !telephone || !email || !adresse) {
                alert("Tous les champs sont obligatoires.");
                return;
            }

            const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
            const reservationsConfirmees = JSON.parse(localStorage.getItem("reservationsConfirmees")) || {};

            reservations.forEach(res => {
                if (!reservationsConfirmees[res.nom]) {
                    reservationsConfirmees[res.nom] = [];
                }
                reservationsConfirmees[res.nom].push({ dateDebut: res.dateDebut, dateFin: res.dateFin });
            });

            localStorage.setItem("reservationsConfirmees", JSON.stringify(reservationsConfirmees));
            alert("Réservation effectuée avec succès !");
            localStorage.removeItem("reservations");
            popup.style.display = "none";
            afficherReservations();
        });
    }

    afficherReservations(); // Affichage dès le chargement

    // Affiche les dates déjà réservées
    if (document.querySelector(".btn-reserver")) {
        const reservationsConfirmees = JSON.parse(localStorage.getItem("reservationsConfirmees")) || {};

        document.querySelectorAll("div[data-nom]").forEach(div => {
            const nomVoiture = div.getAttribute("data-nom");
            const dates = reservationsConfirmees[nomVoiture] || [];

           /* if (dates.length > 0) {
                const ul = document.createElement("ul");
                ul.innerHTML = "<strong>Dates déjà réservées :</strong>";
                dates.forEach(d => {
                    const li = document.createElement("li");
                    li.textContent = `${d.dateDebut} → ${d.dateFin}`;
                    ul.appendChild(li);
                });
                div.appendChild(ul);
            }*/
                if (dates.length > 0) {
                    const ul = document.createElement("ul");
                    ul.classList.add("scrollable-dates"); // 👈 ajoute cette ligne
                    /*ul.innerHTML = "<strong>Dates déjà réservées :</strong>";*/
                    dates.forEach(d => {
                        const li = document.createElement("li");
                        li.textContent = `${d.dateDebut} → ${d.dateFin}`;
                        ul.appendChild(li);
                    });
                    div.appendChild(ul);
                }
        });
    }

    // Menu animation au scroll
    window.addEventListener("scroll", function () {
        let header = document.querySelector("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Témoignages dynamiques
    let testimonials = [
        { text: "Super service ! Voitures en excellent état et réservation facile.", author: "Ali" },
        { text: "Prix compétitifs et service client au top, je recommande.", author: "Mohammed" },
        { text: "Rapide, efficace et sans surprise, parfait !", author: "Omar" }
    ];

    let testimonialIndex = 0;
    function updateTestimonial() {
        let testimonial = document.querySelector(".testimonial p");
        let author = document.querySelector(".testimonial h4");

        if (testimonial && author) {
            testimonial.textContent = `"${testimonials[testimonialIndex].text}"`;
            author.textContent = `- ${testimonials[testimonialIndex].author}`;
            testimonialIndex = (testimonialIndex + 1) % testimonials.length;
        }
    }

    setInterval(updateTestimonial, 5000);
});

// Fonction pour vérifier le chevauchement
function datesChevauchent(debut1, fin1, debut2, fin2) {
    return (new Date(debut1) <= new Date(fin2)) && (new Date(fin1) >= new Date(debut2));
}
