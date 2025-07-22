const UserModel = require("../Model/UserModel");

const getCurrentUser = async (req, res) => {
    try {
        console.log('getCurrentUser - req.userId:', req.userId);
        const userId = req.userId;
        const user = await UserModel.findById(userId);
        console.log('getCurrentUser - found user:', user ? 'yes' : 'no');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failure"
            });
        }
        
        const { _id, name, email, createdAt, wishlist } = user;
        res.status(200).json({
            user: {
                _id: _id,
                name: name,
                email: email,
                createdAt: createdAt,
                wishlist: wishlist
            },
            status: "success",
        });
    } catch (err) {
        console.error('getCurrentUser error:', err);
        res.status(500).json({
            message: err.message,
            status: "failure",
        });
    }
};

const getUserWishlist = async (req, res) => {
    try {
        console.log('getUserWishlist - req.userId:', req.userId);
        const userId = req.userId;
        const user = await UserModel.findById(userId);
        console.log('getUserWishlist - found user:', user ? 'yes' : 'no');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failure",
            });
        }
        res.status(200).json({
            data: user.wishlist,
            status: "success",
        });
    } catch (err) {
        console.error('getUserWishlist error:', err);
        res.status(500).json({
            message: err.message,
            status: "failure",
        });
    }
};

const addToWishlist = async (req, res) => {
    try {
        console.log('addToWishlist - req.userId:', req.userId);
        console.log('addToWishlist - req.body:', req.body);
        
        const userId = req.userId;
        const listing = req.body;
        
        if (!userId) {
            return res.status(401).json({
                message: "User ID not found",
                status: "failure"
            });
        }
        
        if (!listing || !listing.id) {
            return res.status(400).json({
                message: "Invalid listing data - missing id",
                status: "failure"
            });
        }
        
        const user = await UserModel.findById(userId);
        console.log('addToWishlist - found user:', user ? 'yes' : 'no');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: "failure"
            });
        }

        const alreadyExists = user.wishlist.find(item => item.id === listing.id);
        if (alreadyExists) {
            return res.status(400).json({
                message: "Item already in wishlist",
                status: "failure"
            });
        }
        
        user.wishlist.push(listing);
        await user.save();
        
        res.status(200).json({
            message: "Item added to wishlist",
            status: "success",
            wishlist: user.wishlist
        });
    } catch (err) {
        console.error('addToWishlist error:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            message: err.message,
            status: "failure",
        });
    }
};
module.exports = {
    getCurrentUser,
    getUserWishlist,
    addToWishlist
};