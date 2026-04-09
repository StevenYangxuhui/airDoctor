import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==================== 内存数据存储 ====================
interface User {
  id: string;
  phone: string;
  name: string;
  idCard: string;
  age: number;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  doctorNotes: string;
  createdAt: string;
}

interface HealthRecord {
  id: string;
  userId: string;
  type: 'bloodPressure' | 'bloodSugar';
  value: number;
  secondaryValue?: number; // 舒张压或饭后血糖
  recordDate: string;
  createdAt: string;
}

interface DietItem {
  id: string;
  name: string;
  category: 'red' | 'yellow' | 'green';
  reason: string;
  diseases: string[]; // 适用疾病类型
}

interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  notes: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  userId: string;
  hospital: string;
  department: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

// 内存存储
const users: Map<string, User> = new Map();
const healthRecords: Map<string, HealthRecord[]> = new Map();
let dietItems: DietItem[] = [
  { id: '1', name: '腌制食品', category: 'red', reason: '含大量亚硝酸盐', diseases: ['高血压', '心脏病'] },
  { id: '2', name: '肥肉', category: 'red', reason: '高脂肪', diseases: ['高血压', '高血脂'] },
  { id: '3', name: '动物内脏', category: 'red', reason: '高胆固醇', diseases: ['高血脂', '心血管疾病'] },
  { id: '4', name: '咸菜', category: 'red', reason: '高盐分', diseases: ['高血压'] },
  { id: '5', name: '糖果', category: 'red', reason: '高糖分', diseases: ['糖尿病'] },
  { id: '6', name: '油炸食品', category: 'yellow', reason: '中脂肪含量', diseases: ['高血脂'] },
  { id: '7', name: '糕点', category: 'yellow', reason: '含糖量中等', diseases: ['糖尿病'] },
  { id: '8', name: '腊肉', category: 'yellow', reason: '盐分较高', diseases: ['高血压'] },
  { id: '9', name: '全谷物', category: 'green', reason: '富含纤维', diseases: ['高血压', '高血脂', '糖尿病'] },
  { id: '10', name: '新鲜蔬菜', category: 'green', reason: '低热量高纤维', diseases: ['高血压', '高血脂', '糖尿病'] },
  { id: '11', name: '水果', category: 'green', reason: '富含维生素', diseases: ['高血压', '高血脂'] },
  { id: '12', name: '鱼类', category: 'green', reason: '优质蛋白', diseases: ['心血管疾病'] },
  { id: '13', name: '豆制品', category: 'green', reason: '植物蛋白', diseases: ['高血脂'] },
  { id: '14', name: '牛奶', category: 'green', reason: '补钙', diseases: ['骨质疏松'] },
  { id: '15', name: '橄榄油', category: 'green', reason: '不饱和脂肪酸', diseases: ['心血管疾病'] },
];
const medications: Map<string, Medication[]> = new Map();
const appointments: Map<string, Appointment[]> = new Map();

// ==================== 辅助函数 ====================
const generateId = () => Math.random().toString(36).substr(2, 9);

// ==================== 健康检查 ====================
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== 用户认证 ====================
// 注册
app.post('/api/v1/auth/register', (req, res) => {
  try {
    const { phone, name, idCard, age, gender } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ error: '手机号和姓名必填' });
    }

    // 检查是否已存在
    const existingUser = Array.from(users.values()).find(u => u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: '该手机号已注册' });
    }

    const userId = generateId();
    const user: User = {
      id: userId,
      phone,
      name,
      idCard: idCard || '',
      age: age || 0,
      gender: gender || '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalHistory: '',
      doctorNotes: '',
      createdAt: new Date().toISOString()
    };

    users.set(userId, user);
    healthRecords.set(userId, []);
    medications.set(userId, []);
    appointments.set(userId, []);

    res.status(201).json({ success: true, userId, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
app.post('/api/v1/auth/login', (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: '手机号必填' });
    }

    const user = Array.from(users.values()).find(u => u.phone === phone);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.status(200).json({ success: true, userId: user.id, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// ==================== 用户信息 ====================
// 获取用户信息
app.get('/api/v1/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
app.put('/api/v1/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const updatedUser = { ...user, ...updates };
    users.set(userId, updatedUser);

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// ==================== 身体指标记录 ====================
// 添加健康记录
app.post('/api/v1/health-records', (req, res) => {
  try {
    const { userId, type, value, secondaryValue, recordDate } = req.body;

    if (!userId || !type || !value) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const record: HealthRecord = {
      id: generateId(),
      userId,
      type,
      value,
      secondaryValue,
      recordDate: recordDate || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const userRecords = healthRecords.get(userId) || [];
    userRecords.push(record);
    healthRecords.set(userId, userRecords);

    res.status(201).json({ success: true, record });
  } catch (error) {
    console.error('Add health record error:', error);
    res.status(500).json({ error: '添加健康记录失败' });
  }
});

// 获取健康记录列表
app.get('/api/v1/health-records/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { type, startDate, endDate, limit = '30' } = req.query;

    let records = healthRecords.get(userId) || [];

    // 过滤类型
    if (type) {
      records = records.filter(r => r.type === type);
    }

    // 过滤日期范围
    if (startDate) {
      records = records.filter(r => r.recordDate >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.recordDate <= endDate);
    }

    // 按日期倒序
    records.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

    // 限制数量
    records = records.slice(0, parseInt(limit as string));

    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ error: '获取健康记录失败' });
  }
});

// 获取最新健康数据
app.get('/api/v1/health-records/:userId/latest', (req, res) => {
  try {
    const { userId } = req.params;
    const records = healthRecords.get(userId) || [];

    const latestBloodPressure = records
      .filter(r => r.type === 'bloodPressure')
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

    const latestBloodSugar = records
      .filter(r => r.type === 'bloodSugar')
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())[0];

    res.status(200).json({
      success: true,
      latestBloodPressure,
      latestBloodSugar
    });
  } catch (error) {
    console.error('Get latest health records error:', error);
    res.status(500).json({ error: '获取最新健康数据失败' });
  }
});

// ==================== 饮食红绿灯 ====================
// 获取饮食清单
app.get('/api/v1/diet-list', (req, res) => {
  try {
    const { category, disease } = req.query;

    let items = [...dietItems];

    if (category) {
      items = items.filter(item => item.category === category);
    }

    if (disease) {
      items = items.filter(item => item.diseases.includes(disease as string));
    }

    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Get diet list error:', error);
    res.status(500).json({ error: '获取饮食清单失败' });
  }
});

// 搜索饮食禁忌
app.get('/api/v1/diet-search', (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: '请输入搜索关键词' });
    }

    const results = dietItems.filter(item =>
      item.name.includes(keyword as string) ||
      item.reason.includes(keyword as string)
    );

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Diet search error:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// ==================== 用药清单 ====================
// 添加用药
app.post('/api/v1/medications', (req, res) => {
  try {
    const { userId, name, dosage, frequency, reminderTimes, notes } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const medication: Medication = {
      id: generateId(),
      userId,
      name,
      dosage: dosage || '',
      frequency: frequency || '',
      reminderTimes: reminderTimes || [],
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const userMeds = medications.get(userId) || [];
    userMeds.push(medication);
    medications.set(userId, userMeds);

    res.status(201).json({ success: true, medication });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ error: '添加用药失败' });
  }
});

// 获取用药清单
app.get('/api/v1/medications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const meds = medications.get(userId) || [];

    res.status(200).json({ success: true, medications: meds });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: '获取用药清单失败' });
  }
});

// 更新用药
app.put('/api/v1/medications/:medicationId', (req, res) => {
  try {
    const { medicationId } = req.params;
    const updates = req.body;

    for (const [userId, meds] of medications) {
      const index = meds.findIndex(m => m.id === medicationId);
      if (index !== -1) {
        meds[index] = { ...meds[index], ...updates };
        medications.set(userId, meds);
        return res.status(200).json({ success: true, medication: meds[index] });
      }
    }

    res.status(404).json({ error: '用药记录不存在' });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: '更新用药失败' });
  }
});

// 删除用药
app.delete('/api/v1/medications/:medicationId', (req, res) => {
  try {
    const { medicationId } = req.params;

    for (const [userId, meds] of medications) {
      const index = meds.findIndex(m => m.id === medicationId);
      if (index !== -1) {
        meds.splice(index, 1);
        medications.set(userId, meds);
        return res.status(200).json({ success: true });
      }
    }

    res.status(404).json({ error: '用药记录不存在' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: '删除用药失败' });
  }
});

// ==================== 复诊提醒 ====================
// 添加复诊预约
app.post('/api/v1/appointments', (req, res) => {
  try {
    const { userId, hospital, department, doctor, appointmentDate, appointmentTime, notes } = req.body;

    if (!userId || !appointmentDate) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const appointment: Appointment = {
      id: generateId(),
      userId,
      hospital: hospital || '',
      department: department || '',
      doctor: doctor || '',
      appointmentDate,
      appointmentTime: appointmentTime || '',
      status: 'upcoming',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    const userAppts = appointments.get(userId) || [];
    userAppts.push(appointment);
    appointments.set(userId, userAppts);

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('Add appointment error:', error);
    res.status(500).json({ error: '添加预约失败' });
  }
});

// 获取复诊预约列表
app.get('/api/v1/appointments/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    let appts = appointments.get(userId) || [];

    if (status) {
      appts = appts.filter(a => a.status === status);
    }

    // 按日期排序
    appts.sort((a, b) =>
      new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    );

    res.status(200).json({ success: true, appointments: appts });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: '获取预约列表失败' });
  }
});

// 获取即将到来的预约（今天和明天）
app.get('/api/v1/appointments/:userId/upcoming', (req, res) => {
  try {
    const { userId } = req.params;
    const appts = appointments.get(userId) || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const upcoming = appts.filter(a => {
      const apptDate = new Date(a.appointmentDate);
      apptDate.setHours(0, 0, 0, 0);
      return a.status === 'upcoming' &&
        apptDate >= today &&
        apptDate < dayAfterTomorrow;
    });

    res.status(200).json({ success: true, appointments: upcoming });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ error: '获取即将到来的预约失败' });
  }
});

// 更新预约状态
app.put('/api/v1/appointments/:appointmentId', (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updates = req.body;

    for (const [userId, appts] of appointments) {
      const index = appts.findIndex(a => a.id === appointmentId);
      if (index !== -1) {
        appts[index] = { ...appts[index], ...updates };
        appointments.set(userId, appts);
        return res.status(200).json({ success: true, appointment: appts[index] });
      }
    }

    res.status(404).json({ error: '预约记录不存在' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: '更新预约失败' });
  }
});

// ==================== 病历上传（模拟）====================
app.post('/api/v1/medical-records/upload', (req, res) => {
  try {
    const { userId, imageBase64 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    // 模拟OCR识别结果
    const mockResult = {
      success: true,
      message: '病历上传成功，等待审核',
      parsedData: {
        diagnosis: '高血压病',
        medications: ['硝苯地平缓释片 20mg 每日1次', '阿司匹林肠溶片 100mg 每日1次'],
        instructions: '低盐低脂饮食，适量运动，定期监测血压'
      }
    };

    // 更新用户病历信息
    const user = users.get(userId);
    if (user) {
      user.medicalHistory = mockResult.parsedData.diagnosis;
      user.doctorNotes = mockResult.parsedData.instructions;
      users.set(userId, user);

      // 自动添加识别出的药物
      mockResult.parsedData.medications.forEach((med: string) => {
        const parts = med.split(' ');
        const medication: Medication = {
          id: generateId(),
          userId,
          name: parts[0] || med,
          dosage: parts.slice(1).join(' ') || '',
          frequency: '',
          reminderTimes: [],
          notes: '从病历自动识别',
          createdAt: new Date().toISOString()
        };
        const userMeds = medications.get(userId) || [];
        userMeds.push(medication);
        medications.set(userId, userMeds);
      });
    }

    res.status(200).json(mockResult);
  } catch (error) {
    console.error('Upload medical record error:', error);
    res.status(500).json({ error: '上传病历失败' });
  }
});

// ==================== 紧急联系人 ====================
app.post('/api/v1/emergency/notify', (req, res) => {
  try {
    const { userId, message, location } = req.body;

    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    const user = users.get(userId);

    // 模拟发送紧急通知
    console.log('紧急通知已发送:', {
      userId,
      userName: user?.name,
      emergencyContact: user?.emergencyContact,
      emergencyPhone: user?.emergencyPhone,
      message: message || '患者发起紧急求助',
      location,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: '紧急通知已发送',
      contactName: user?.emergencyContact,
      contactPhone: user?.emergencyPhone
    });
  } catch (error) {
    console.error('Emergency notify error:', error);
    res.status(500).json({ error: '发送紧急通知失败' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`云用药服务器已启动，端口: ${port}`);
});
