const Notification = require("../Model/Notification");


async function getNotification(req,res){
    try{
        const userId=req.userId;
        const notifications=await Notification.find({userId})
        .sort({createdAt: -1})

        res.status(200).json({
            status:'success',
            notifications,
        });
    }
catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
  }
}


module.exports={getNotification}
