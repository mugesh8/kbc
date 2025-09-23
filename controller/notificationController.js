const Notification = require('../model/notification');
const Member = require('../model/member');

const getNotifications = async (req, res) => {
    try {
        const { member_id } = req.params;

        const notifications = await Notification.findAll({
            where: { receiver_id: member_id },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Member, as: 'sender', attributes: ['mid', 'first_name', 'last_name'] }
            ]
        });

        return res.status(200).json({
            message: 'Notifications fetched successfully',
            data: notifications,
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const profileViewNotification = async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({ error: 'sender_id and receiver_id are required.' });
    }

    if (sender_id === receiver_id) {
      return res.status(400).json({ error: 'You cannot send a notification to yourself.' });
    }

    const viewer = await Member.findByPk(sender_id);
    if (!viewer) {
      return res.status(404).json({ error: 'Viewer not found.' });
    }

    const viewerName = viewer.first_name+viewer.last_name || 'Someone';

    const latestNotification = await Notification.findOne({
      where: {
        sender_id,
        receiver_id,
        type: 'profile_view'
      },
      order: [['createdAt', 'DESC']]
    });

    const now = new Date();
    const thresholdInMinutes = 60;
    const timeLimit = thresholdInMinutes * 60 * 1000; 

    if (
      latestNotification &&
      now - new Date(latestNotification.createdAt) < timeLimit
    ) {
      return res.status(200).json({
        message: `Notification already sent within last ${thresholdInMinutes} minute(s), skipping.`,
      });
    }

    await Notification.create({
      sender_id,
      receiver_id,
      type: 'profile_view',
      message: `${viewerName} viewed your profile.`,
    });

    return res.status(200).json({
      message: 'New profile view notification created successfully.',
    });

  } catch (err) {
    console.error('Error creating profile view notification:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    notification.is_read = true;
    await notification.save();

    return res.status(200).json({
      message: 'Notification marked as read successfully.',
      data: notification,
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { receiver_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({ error: 'receiver_id is required.' });
    }

    const result = await Notification.update(
      { is_read: true },
      {
        where: {
          receiver_id,
          is_read: false,
        },
      }
    );

    return res.status(200).json({
      message: `Marked ${result[0]} notifications as read.`,
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};





module.exports = {
    getNotifications,
    profileViewNotification,
    markAsRead,
    markAllAsRead
};