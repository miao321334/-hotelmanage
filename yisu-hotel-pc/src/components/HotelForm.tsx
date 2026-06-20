import { useState, useEffect } from 'react';
import { CreateHotelDto } from '../types';
import { Form, Input, InputNumber, DatePicker, Button, Space, message, Upload, Card, Select, Radio } from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getImageUrl, getTags } from '../lib/api';

const { TextArea } = Input;
const { Option } = Select;

// 组件 props 类型
interface HotelFormProps {
  defaultValues?: Partial<CreateHotelDto>; // 编辑时传入默认值
  onSubmit: (
    data: CreateHotelDto,
    fileList: any[],
    imageDescriptions: { [key: string]: string },
    mainImageIndex: number
  ) => Promise<void>;
  loading?: boolean; // 提交加载状态
  existingImages?: any[]; // 已有图片数组
  onUpdateImage?: (imageId: string, data: { description?: string; isMain?: boolean }) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<void>;
  onUploadImage?: (file: File, description: string, isMain: boolean) => Promise<void>;
}

export default function HotelForm({
  defaultValues,
  onSubmit,
  loading,
  existingImages = [],
  onUpdateImage,
  onDeleteImage,
  onUploadImage,
}: HotelFormProps) {
  const [form] = Form.useForm();
  const [newFiles, setNewFiles] = useState<any[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<{ [key: string]: string }>({});
  const [mainImageIndex, setMainImageIndex] = useState<number>(-1); // -1 表示没有主图
  const [tagOptions, setTagOptions] = useState<any[]>([]);
  const [tagLoading, setTagLoading] = useState(false);

  // 初始化表单默认值
  useEffect(() => {
    const initValues: any = defaultValues
      ? {
        ...defaultValues,
        openingDate: defaultValues.openingDate ? dayjs(defaultValues.openingDate) : dayjs(),
        starRating: defaultValues.starRating || 3,
      }
      : {
        openingDate: dayjs(),
        starRating: 3,
      };
    form.setFieldsValue(initValues);
    const fetchTags = async () => {
      setTagLoading(true);
      try {
        const data = await getTags();
        setTagOptions(data);
      } catch (error) {
        message.error('加载标签失败');
      } finally {
        setTagLoading(false);
      }
    };
    fetchTags();
  }, [defaultValues, form]);

  // 处理新文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFilesData = files.map(file => ({
      uid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      originFileObj: file,
      url: URL.createObjectURL(file),
      status: 'ready',
    }));
    setNewFiles(prev => [...prev, ...newFilesData]);
    e.target.value = '';
  };

  // 删除待上传新图片
  const handleRemoveNew = (uid: string) => {
    setNewFiles(prev => {
      const file = prev.find(f => f.uid === uid);
      if (file?.url) URL.revokeObjectURL(file.url); // 释放内存
      return prev.filter(f => f.uid !== uid);
    });
    setImageDescriptions(prev => {
      const newDesc = { ...prev };
      delete newDesc[uid];
      return newDesc;
    });
    // 如果删除的是主图，重置主图索引
    const deleteIndex = newFiles.findIndex(f => f.uid === uid);
    if (mainImageIndex === deleteIndex) {
      setMainImageIndex(-1);
    } else if (mainImageIndex > deleteIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  // 设置已有图片为主图
  const handleSetExistingMain = async (imageId: string, currentIsMain: boolean) => {
    if (currentIsMain) return; // 已经是主图，无需操作

    try {
      await onUpdateImage?.(imageId, { isMain: true });
      message.success('主图设置成功');
    } catch (error) {
      message.error('设置主图失败');
    }
  };

  // 设置新图片为主图（仅本地状态，提交时生效）
  const handleSetNewMain = (index: number) => {
    setMainImageIndex(index);
  };

  // 提交前验证并调用父组件 onSubmit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values, newFiles, imageDescriptions, mainImageIndex);
    } catch (error) {
      message.error('表单填写有误');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 800 }}
      colon={false}
    >
      {/* 酒店中文名 */}
      <Form.Item
        name="nameZh"
        label="酒店中文名"
        rules={[{ required: true, message: '酒店中文名不能为空' }]}
      >
        <Input
          placeholder="请输入酒店中文名"
          size="large"
        />
      </Form.Item>

      {/* 酒店英文名 */}
      <Form.Item
        name="nameEn"
        label="酒店英文名"
        rules={[{ required: true, message: '酒店英文名不能为空' }]}
      >
        <Input
          placeholder="请输入酒店英文名"
          size="large"
        />
      </Form.Item>

      {/* 地址 */}
      <Form.Item
        name="address"
        label="详细地址"
        rules={[{ required: true, message: '酒店地址不能为空' }]}
      >
        <Input
          placeholder="请输入酒店详细地址"
          size="large"
        />
      </Form.Item>

      {/* 星级 */}
      <Form.Item
        name="starRating"
        label="星级 (1-5)"
        rules={[
          { required: true, message: '星级不能为空' },
          { type: 'number', min: 1, message: '星级不能小于1' },
          { type: 'number', max: 5, message: '星级不能大于5' }
        ]}
      >
        <InputNumber
          min={1}
          max={5}
          placeholder="请选择星级"
          style={{ width: '100%' }}
          size="large"
        />
      </Form.Item>

      {/* 开业时间 */}
      <Form.Item
        name="openingDate"
        label="开业时间"
        rules={[{ required: true, message: '开业时间不能为空' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          size="large"
          placeholder="请选择开业时间"
          format="YYYY-MM-DD"
        />
      </Form.Item>

      {/* 描述（可选） */}
      <Form.Item
        name="description"
        label="酒店描述（可选）"
      >
        <Input.TextArea
          rows={4}
          placeholder="请输入酒店特色、设施等描述信息"
          size="large"
        />
      </Form.Item>

      {/* 附近景点列表 */}
      <Form.List name="nearbyAttractions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" title={`景点 ${name + 1}`} style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="景点名称"
                    rules={[{ required: true, message: '请输入景点名称' }]}
                  >
                    <Input placeholder="如：天安门" />
                  </Form.Item>
                  <Space>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label="类型"
                      rules={[{ required: true }]}
                    >
                      <Select style={{ width: 120 }}>
                        <Option value="attraction">景点</Option>
                        <Option value="transportation">交通枢纽</Option>
                        <Option value="shopping">购物中心</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'distance']}
                      label="距离（可选）"
                    >
                      <Input placeholder="如：1.5km" />
                    </Form.Item>
                  </Space>
                  <Button type="link" onClick={() => remove(name)}>删除</Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加附近景点
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* 设施列表 */}
      <Form.List name="facilities">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" title={`设施 ${name + 1}`} style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="设施名称"
                    rules={[{ required: true, message: '请输入设施名称' }]}
                  >
                    <Input placeholder="如：免费WiFi" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label="描述（可选）"
                  >
                    <Input.TextArea rows={2} placeholder="可选" />
                  </Form.Item>
                  <Button type="link" onClick={() => remove(name)}>删除</Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加设施
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* 标签选择 */}
      <Form.Item name="tagIds" label="酒店标签">
        <Select
          mode="multiple"
          placeholder="请选择标签"
          loading={tagLoading}
          allowClear
        >
          {tagOptions.map(tag => (
            <Option key={tag.id} value={tag.id}>{tag.name}</Option>
          ))}
        </Select>
      </Form.Item>

      {/* 图片区域 */}
      <Form.Item label="酒店图片" required={false}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'block', marginBottom: 16 }}
          />

          {/* 已有图片区域 */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12, color: '#666' }}>已上传图片</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      border: '1px solid #d9d9d9',
                      padding: 12,
                      borderRadius: 8,
                      width: 180,
                      background: '#fafafa'
                    }}
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={img.description || ''}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginBottom: 8
                      }}
                    />

                    {/* 主图选择 */}
                    <div style={{ marginBottom: 8 }}>
                      <Radio
                        checked={img.isMain}
                        onClick={() => handleSetExistingMain(img.id, img.isMain)}
                      >
                        主图
                      </Radio>
                    </div>

                    {/* 图片描述 */}
                    <Input.TextArea
                      placeholder="图片描述"
                      rows={2}
                      value={img.description || ''}
                      onChange={(e) => onUpdateImage?.(img.id, { description: e.target.value })}
                      style={{ marginBottom: 8, fontSize: 12 }}
                    />

                    <Button
                      size="small"
                      danger
                      block
                      onClick={() => onDeleteImage?.(img.id)}
                    >
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 待上传新图片区域 */}
          {newFiles.length > 0 && (
            <div>
              <h4 style={{ marginBottom: 12, color: '#666' }}>待上传图片</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {newFiles.map((file, index) => (
                  <div
                    key={file.uid}
                    style={{
                      border: '2px dashed #1890ff',
                      padding: 12,
                      borderRadius: 8,
                      width: 180,
                      background: '#f0f5ff'
                    }}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginBottom: 8
                      }}
                    />

                    {/* 主图选择 */}
                    <div style={{ marginBottom: 8 }}>
                      <Radio
                        checked={mainImageIndex === index}
                        onClick={() => handleSetNewMain(index)}
                      >
                        主图
                      </Radio>
                    </div>

                    {/* 图片描述 */}
                    <Input.TextArea
                      placeholder="图片描述"
                      rows={2}
                      value={imageDescriptions[file.uid] || ''}
                      onChange={(e) => {
                        setImageDescriptions(prev => ({
                          ...prev,
                          [file.uid]: e.target.value
                        }));
                      }}
                      style={{ marginBottom: 8, fontSize: 12 }}
                    />

                    <Button
                      size="small"
                      danger
                      block
                      onClick={() => handleRemoveNew(file.uid)}
                    >
                      移除
                    </Button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
                提示：点击"提交酒店信息"后，新图片将随表单一起上传
              </div>
            </div>
          )}

          {existingImages.length === 0 && newFiles.length === 0 && (
            <div style={{ color: '#999', padding: '20px 0' }}>
              暂无图片，请选择文件上传
            </div>
          )}
        </div>
      </Form.Item>

      {/* 房型列表 */}
      <Form.List name="rooms">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" title={`房型 ${name + 1}`} style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="房型名称"
                    rules={[{ required: true, message: '请输入房型名称' }]}
                  >
                    <Input placeholder="如：大床房" />
                  </Form.Item>
                  <Space>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      label="价格"
                      rules={[{ required: true, message: '请输入价格' }]}
                    >
                      <InputNumber min={0} step={0.01} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'capacity']}
                      label="可住人数"
                      rules={[{ required: true, message: '请输入可住人数' }]}
                    >
                      <InputNumber min={1} style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label="库存"
                      rules={[{ required: true, message: '请输入房间数量' }]}
                    >
                      <InputNumber min={0} style={{ width: 100 }} />
                    </Form.Item>
                  </Space>
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label="描述（可选）"
                  >
                    <Input.TextArea rows={2} placeholder="可选" />
                  </Form.Item>
                  <Button type="link" onClick={() => remove(name)}>
                    删除
                  </Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加房型
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* 促销信息 */}
      <Form.List name="promotions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" title={`促销 ${name + 1}`} style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="促销名称"
                    rules={[{ required: true, message: '请输入促销名称' }]}
                  >
                    <Input placeholder="如：开业大酬宾" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label="描述"
                  >
                    <Input.TextArea rows={2} placeholder="可选" />
                  </Form.Item>
                  <Space>
                    <Form.Item
                      {...restField}
                      name={[name, 'discountType']}
                      label="折扣类型"
                      rules={[{ required: true }]}
                    >
                      <Select style={{ width: 120 }}>
                        <Select.Option value="percentage">百分比</Select.Option>
                        <Select.Option value="fixed">固定金额</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'discountValue']}
                      label="折扣值"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} style={{ width: 120 }} />
                    </Form.Item>
                  </Space>
                  <Space>
                    <Form.Item
                      {...restField}
                      name={[name, 'startDate']}
                      label="开始日期"
                      rules={[{ required: true }]}
                    >
                      <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'endDate']}
                      label="结束日期"
                      rules={[{ required: true }]}
                    >
                      <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                  </Space>
                  <Button type="link" onClick={() => remove(name)} >
                    删除
                  </Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加促销
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      {/* 提交按钮 */}
      <Form.Item>
        <Space>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            {loading ? '提交中...' : '提交酒店信息'}
          </Button>
        </Space>
      </Form.Item>
    </Form >
  );
}