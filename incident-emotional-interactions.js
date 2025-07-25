// 🎭 EMOTIONAL INTERACTIONS - Begeisterung durch Interaktivität
console.log('🎭 Loading Emotional Interactions...');

// Erweitere QHSEDashboard mit emotionalen Interaktionen
if (typeof QHSEDashboard !== 'undefined') {
    
    // ===== CELEBRATION EFFECTS =====
    QHSEDashboard.prototype.triggerCelebration = function(x = window.innerWidth/2, y = window.innerHeight/2) {
        console.log('🎉 Triggering celebration effect!');
        
        const celebration = document.createElement('div');
        celebration.className = 'celebration-burst';
        celebration.style.left = x + 'px';
        celebration.style.top = y + 'px';
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 600);
    };
    
    // ===== SUCCESS RIPPLE EFFECT =====
    QHSEDashboard.prototype.createSuccessRipple = function(element) {
        console.log('💫 Creating success ripple...');
        
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'success-ripple';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (rect.left + rect.width/2 - size/2) + 'px';
        ripple.style.top = (rect.top + rect.height/2 - size/2) + 'px';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 800);
    };
    
    // ===== ACHIEVEMENT NOTIFICATION =====
    QHSEDashboard.prototype.showAchievement = function(message, icon = '🏅') {
        console.log('🏆 Showing achievement:', message);
        
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `${icon} ${message}`;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3500);
    };
    
    // ===== PARTICLE SYSTEM =====
    QHSEDashboard.prototype.createParticleSystem = function(container) {
        console.log('✨ Creating particle system...');
        
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-system';
        
        // Create particles
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 4 + 's';
            particleContainer.appendChild(particle);
        }
        
        container.appendChild(particleContainer);
        
        // Remove after particles finish
        setTimeout(() => {
            if (particleContainer.parentNode) {
                particleContainer.parentNode.removeChild(particleContainer);
            }
        }, 6000);
    };
    
    // ===== CONFETTI EXPLOSION =====
    QHSEDashboard.prototype.createConfetti = function() {
        console.log('🎊 Creating confetti explosion!');
        
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = ['#667eea', '#764ba2', '#f093fb', '#fa709a'][Math.floor(Math.random() * 4)];
            confettiContainer.appendChild(confetti);
        }
        
        document.body.appendChild(confettiContainer);
        
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 3000);
    };
    
    // ===== ENHANCED FORM SUBMISSION =====
    const originalSaveIncident = QHSEDashboard.prototype.saveIncident;
    QHSEDashboard.prototype.saveIncident = function(type) {
        console.log('💖 Enhanced save with emotional feedback!');
        
        // Call original save function
        const result = originalSaveIncident.call(this, type);
        
        // Add emotional feedback
        if (result !== false) {
            // Trigger celebration at button position
            const submitBtn = document.querySelector('.modal .btn-primary');
            if (submitBtn) {
                const rect = submitBtn.getBoundingClientRect();
                this.triggerCelebration(rect.left + rect.width/2, rect.top + rect.height/2);
                this.createSuccessRipple(submitBtn);
            }
            
            // Show achievement
            const messages = [
                'Incident erfolgreich gemeldet! 🎯',
                'Großartige Arbeit! Sicherheit first! 💪',
                'Meldung eingegangen - Du machst den Unterschied! ⭐',
                'Danke für deine Wachsamkeit! 🛡️',
                'Ein Schritt näher zur Zero-Incident-Zone! 🚀'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.showAchievement(randomMessage);
            
            // Add particle effects to the container
            setTimeout(() => {
                const currentSection = document.querySelector('.content-section:not(.hidden)');
                if (currentSection) {
                    this.createParticleSystem(currentSection);
                }
            }, 500);
        }
        
        return result;
    };
    
    // ===== ENHANCED HOVER EFFECTS =====
    QHSEDashboard.prototype.enhanceHoverEffects = function() {
        console.log('🌟 Enhancing hover effects...');
        
        // Add motivational messages to buttons
        const buttons = document.querySelectorAll('.btn-primary');
        const motivationalMessages = [
            'Klick für Sicherheit! 🛡️',
            'Deine Stimme zählt! 📢',
            'Gemeinsam für null Unfälle! 🎯',
            'Safety Heroes gesucht! 🦸‍♂️',
            'Mach den Unterschied! ⭐'
        ];
        
        buttons.forEach((btn, index) => {
            if (!btn.dataset.motivation) {
                btn.dataset.motivation = motivationalMessages[index % motivationalMessages.length];
            }
        });
        
        // Add inspirational quotes to containers
        const containers = document.querySelectorAll('.accidents-container, .near-miss-container');
        const inspirationalQuotes = [
            '"Sicherheit ist kein Zufall" 🎯',
            '"Vorsicht ist besser als Nachsicht" 🛡️',
            '"Gemeinsam für null Unfälle" ⭐',
            '"Deine Aufmerksamkeit rettet Leben" 💪'
        ];
        
        containers.forEach((container, index) => {
            container.classList.add('inspirational-container');
            container.dataset.inspiration = inspirationalQuotes[index % inspirationalQuotes.length];
        });
    };
    
    // ===== MOOD-RESPONSIVE ELEMENTS =====
    QHSEDashboard.prototype.addMoodResponsive = function() {
        console.log('😊 Adding mood-responsive elements...');
        
        // Add positive vibes to resolved incidents
        const resolvedCards = document.querySelectorAll('.incident-status.abgeschlossen');
        resolvedCards.forEach(card => {
            const incidentCard = card.closest('.incident-card');
            if (incidentCard) {
                incidentCard.classList.add('positive-vibe');
            }
        });
        
        // Add surprise elements to random cards
        const allCards = document.querySelectorAll('.incident-card.compact');
        if (allCards.length > 0) {
            const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
            randomCard.classList.add('surprise-element');
        }
        
        // Add milestone markers to significant numbers
        const statNumbers = document.querySelectorAll('.stat-card div span');
        statNumbers.forEach(span => {
            const number = parseInt(span.textContent);
            if (number > 0 && (number === 10 || number === 25 || number === 50 || number === 100)) {
                span.classList.add('milestone');
            }
        });
    };
    
    // ===== AUTO-ENHANCEMENT ON SECTION SHOW =====
    const originalShowSection = QHSEDashboard.prototype.showSection;
    QHSEDashboard.prototype.showSection = function(sectionId) {
        console.log('🎨 Enhanced section show with emotional elements!');
        
        const result = originalShowSection.call(this, sectionId);
        
        // Add enhancements to incident sections
        if (sectionId === 'accident' || sectionId === 'near-miss' || sectionId === 'incident-overview') {
            setTimeout(() => {
                this.enhanceHoverEffects();
                this.addMoodResponsive();
                
                // Add mood boost to empty states
                const emptyMessages = document.querySelectorAll('.no-data-message');
                emptyMessages.forEach(msg => {
                    msg.classList.add('encouraging', 'mood-boost');
                });
                
                // Add happy interactions to interactive elements
                const interactiveElements = document.querySelectorAll('.stat-card, .incident-card.compact, .btn-primary');
                interactiveElements.forEach(el => {
                    el.classList.add('happy-interaction');
                });
                
            }, 200);
        }
        
        return result;
    };
    
    // ===== MILESTONE CELEBRATIONS =====
    QHSEDashboard.prototype.checkMilestones = function() {
        const incidents = this.loadIncidentsFromStorage();
        const totalCount = incidents.length;
        
        // Celebrate milestones
        if (totalCount === 1) {
            this.showAchievement('Erste Meldung eingegangen! 🎉', '🥇');
            this.createConfetti();
        } else if (totalCount % 10 === 0 && totalCount > 0) {
            this.showAchievement(`${totalCount} Meldungen erreicht! 🏆`, '🎊');
            this.createConfetti();
        }
    };
    
    console.log('🎭 Emotional Interactions loaded successfully!');
} else {
    console.warn('⚠️ QHSEDashboard not found - emotional interactions cannot be initialized');
}

// ===== AUTO-INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Initializing emotional interactions...');
    
    setTimeout(() => {
        if (window.qhseDashboard) {
            // Enhance existing elements
            window.qhseDashboard.enhanceHoverEffects();
            window.qhseDashboard.addMoodResponsive();
            
            console.log('🎭 Emotional interactions initialized successfully!');
        }
    }, 1000);
});