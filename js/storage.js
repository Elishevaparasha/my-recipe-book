// ניהול localStorage
const Storage = {
    // משתמשים
    getUsers: () => JSON.parse(localStorage.getItem('users') || '[]'),
    
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser') || 'null'),
    
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    
    logout: () => localStorage.removeItem('currentUser'),
    
    // מתכונים
    getRecipes: () => JSON.parse(localStorage.getItem('recipes') || '[]'),
    
    saveRecipes: (recipes) => localStorage.setItem('recipes', JSON.stringify(recipes)),
    
    addRecipe: (recipe) => {
        const recipes = Storage.getRecipes();
        recipe.id = Date.now();
        recipes.push(recipe);
        Storage.saveRecipes(recipes);
        return recipe;
    },
    
    getRecipeById: (id) => {
        const recipes = Storage.getRecipes();
        return recipes.find(r => r.id === parseInt(id));
    },
    
    // הגדרות משתמש
    updateUserSettings: (userId, settings) => {
        const users = Storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].settings = { ...users[userIndex].settings, ...settings };
            Storage.saveUsers(users);
            
            // עדכון המשתמש הנוכחי
            const currentUser = Storage.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.settings = users[userIndex].settings;
                Storage.setCurrentUser(currentUser);
            }
        }
    },
    
    getUserSettings: (userId) => {
        const users = Storage.getUsers();
        const user = users.find(u => u.id === userId);
        return user ? user.settings : null;
    },
    
    // מועדפים
    toggleFavorite: (userId, recipeId) => {
        const users = Storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const favorites = users[userIndex].favorites || [];
            const index = favorites.indexOf(recipeId);
            
            if (index > -1) {
                favorites.splice(index, 1);
            } else {
                favorites.push(recipeId);
            }
            
            users[userIndex].favorites = favorites;
            Storage.saveUsers(users);
            
            const currentUser = Storage.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.favorites = favorites;
                Storage.setCurrentUser(currentUser);
            }
            
            return favorites;
        }
    },
    
    isFavorite: (userId, recipeId) => {
        const users = Storage.getUsers();
        const user = users.find(u => u.id === userId);
        return user && user.favorites ? user.favorites.includes(recipeId) : false;
    },
    
    getFavorites: (userId) => {
        const users = Storage.getUsers();
        const user = users.find(u => u.id === userId);
        return user && user.favorites ? user.favorites : [];
    },
    
    // דירוגים
    rateRecipe: (recipeId, userId, rating) => {
        const recipes = Storage.getRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === parseInt(recipeId));
        
        if (recipeIndex !== -1) {
            if (!recipes[recipeIndex].ratings) {
                recipes[recipeIndex].ratings = [];
            }
            
            const existingRating = recipes[recipeIndex].ratings.findIndex(r => r.userId === userId);
            
            if (existingRating > -1) {
                recipes[recipeIndex].ratings[existingRating].rating = rating;
            } else {
                recipes[recipeIndex].ratings.push({ userId, rating });
            }
            
            // חישוב ממוצע
            const sum = recipes[recipeIndex].ratings.reduce((acc, r) => acc + r.rating, 0);
            recipes[recipeIndex].rating = sum / recipes[recipeIndex].ratings.length;
            
            Storage.saveRecipes(recipes);
            return recipes[recipeIndex].rating;
        }
    },
    
    getUserRating: (recipeId, userId) => {
        const recipe = Storage.getRecipeById(recipeId);
        if (recipe && recipe.ratings) {
            const userRating = recipe.ratings.find(r => r.userId === userId);
            return userRating ? userRating.rating : 0;
        }
        return 0;
    },
    
    // סטטיסטיקות
    incrementViews: (recipeId) => {
        const recipes = Storage.getRecipes();
        const recipeIndex = recipes.findIndex(r => r.id === parseInt(recipeId));
        if (recipeIndex !== -1) {
            recipes[recipeIndex].views = (recipes[recipeIndex].views || 0) + 1;
            Storage.saveRecipes(recipes);
        }
    },
    
    updateUserStats: (userId, stat, value) => {
        const users = Storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            if (!users[userIndex].stats) {
                users[userIndex].stats = { recipesViewed: 0, recipesCooked: 0, totalCookingTime: 0 };
            }
            users[userIndex].stats[stat] = (users[userIndex].stats[stat] || 0) + value;
            Storage.saveUsers(users);
            
            const currentUser = Storage.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.stats = users[userIndex].stats;
                Storage.setCurrentUser(currentUser);
            }
        }
    }
};
