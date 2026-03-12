// ניהול התחברות
const Auth = {
    login: (username, password) => {
        const users = Storage.getUsers();
        let user = users.find(u => u.username === username && u.password === password);
        
        // אם המשתמש לא קיים - צור אותו אוטומטית!
        if (!user) {
            // יצירת משתמש חדש
            const newUser = {
                id: Date.now(),
                username: username,
                password: password,
                settings: {
                    speechDelay: 2000,
                    theme: 'warm',
                    fontSize: 'medium',
                    speechRate: 1.0,
                    soundEffects: true,
                    notifications: true
                },
                favorites: [],
                stats: {
                    recipesViewed: 0,
                    recipesCooked: 0,
                    totalCookingTime: 0
                }
            };
            
            users.push(newUser);
            Storage.saveUsers(users);
            user = newUser;
        }
        
        Storage.setCurrentUser(user);
        return { success: true, user };
    },
    
    logout: () => {
        Storage.logout();
        window.location.href = 'index.html';
    },
    
    isAuthenticated: () => {
        return Storage.getCurrentUser() !== null;
    },
    
    requireAuth: () => {
        if (!Auth.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    },
    
    getCurrentUser: () => Storage.getCurrentUser()
};
