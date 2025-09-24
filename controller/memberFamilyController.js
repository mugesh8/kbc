const Member = require('../model/member');
const {MemberFamily} = require('../model/index');

// GET
const getMemberWithFamily = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findOne({
      where: { mid: id },
      include: [{ model: MemberFamily, as: 'family' }],
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const memberData = member.toJSON();

    if (memberData.marital_status !== 'married' && memberData.family) {
      delete memberData.family.spouse_name;
      delete memberData.family.number_of_children;
    }

    return res.status(200).json(memberData);
  } catch (error) {
    console.error('Fetch Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST
const createMemberWithFamily = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      marital_status,
      family = {}
    } = req.body;

    // Basic validation
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newMember = await Member.create({
      first_name,
      last_name,
      email,
      password,
      marital_status,
    });

    const member_id = newMember.mid;

    let {
      father_name,
      mother_name,
      spouse_name,
      number_of_children,
      address
    } = family;

    if (marital_status !== 'married') {
      spouse_name = null;
      number_of_children = null;
    }

    const newFamily = await MemberFamily.create({
      member_id,
      father_name,
      mother_name,
      spouse_name,
      number_of_children,
      address,
    });

    return res.status(201).json({
      message: 'Member and family created successfully',
      member: newMember,
      family: newFamily,
    });
  } catch (error) {
    console.error('Create Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllFamilies = async (req, res) => {
  try {
    const families = await MemberFamily.findAll({
      attributes: [
        'id',
        'member_id',
        'father_name', 'father_contact',
        'mother_name', 'mother_contact',
        'spouse_name', 'spouse_contact',
        'number_of_children', 'children_names', 'address'
      ]
    });
    return res.status(200).json({ success: true, data: families });
  } catch (error) {
    console.error('Fetch Families Error:', error.message);
    return res.status(500).json({ success: false, msg: 'Failed to fetch families', error: error.message });
  }
}

module.exports = {
  getMemberWithFamily,
  createMemberWithFamily,
  getAllFamilies
};