import { Modal, Descriptions, Table, Image, Tag, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { getHotel } from '../lib/api';
import { Hotel } from '../types';

interface Props {
  hotelId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function HotelDetailModal({ hotelId, open, onClose }: Props) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotelId && open) {
      setLoading(true);
      getHotel(hotelId)
        .then(data => setHotel(data))
        .catch(err => console.error('Failed to load hotel details', err))
        .finally(() => setLoading(false));
    } else {
      setHotel(null);
    }
  }, [hotelId, open]);

  // 房型表格列
  const roomColumns = [
    { title: '房型名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v}` },
    { title: '可住人数', dataIndex: 'capacity', key: 'capacity' },
    { title: '库存', dataIndex: 'quantity', key: 'quantity' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  ];

  // 促销表格列
  const promoColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '折扣类型', dataIndex: 'discountType', key: 'discountType' },
    { title: '折扣值', dataIndex: 'discountValue', key: 'discountValue' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', render: (d: string) => new Date(d).toLocaleDateString() },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  return (
    <Modal
      title="酒店详情"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
      ) : hotel ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 基本信息 */}
          <Descriptions bordered column={2} title="基本信息" size="small">
            <Descriptions.Item label="酒店中文名">{hotel.nameZh}</Descriptions.Item>
            <Descriptions.Item label="酒店英文名">{hotel.nameEn}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{hotel.address}</Descriptions.Item>
            <Descriptions.Item label="星级">{hotel.starRating} 星</Descriptions.Item>
            <Descriptions.Item label="开业时间">{new Date(hotel.openingDate).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {(() => {
                const renderStatus = {
                  approved: '已通过',
                  pending: '待审核',
                  rejected: '已拒绝',
                  offline: '已下线',
                  default: '未知状态'
                };
                const displayText = renderStatus[hotel.status] || renderStatus.default;
                return (
                  <Tag color={
                    hotel.status === 'approved' ? 'success' :
                      hotel.status === 'pending' ? 'warning' :
                        hotel.status === 'rejected' ? 'error' : 'default'
                  }>
                    {displayText}
                  </Tag>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{hotel.description || '无'}</Descriptions.Item>
            {hotel.rejectionReason && (
              <Descriptions.Item label="拒绝原因" span={2}><span style={{ color: 'red' }}>{hotel.rejectionReason}</span></Descriptions.Item>
            )}
          </Descriptions>

          {/* 房型列表 */}
          {hotel.rooms && hotel.rooms.length > 0 ? (
            <div>
              <h3>房型信息</h3>
              <Table
                dataSource={hotel.rooms}
                columns={roomColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          ) : (
            <p>暂无房型信息</p>
          )}

          {/* 促销信息 */}
          {hotel.promotions && hotel.promotions.length > 0 ? (
            <div>
              <h3>促销活动</h3>
              <Table
                dataSource={hotel.promotions}
                columns={promoColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          ) : (
            <p>暂无促销信息</p>
          )}

          {/* 图片列表 */}
          {hotel.images && hotel.images.length > 0 ? (
            <div>
              <h3>酒店图片</h3>
              <Space wrap>
                {hotel.images.map(img => (
                  <div key={img.id} style={{ textAlign: 'center' }}>
                    <Image
                      src={img.url.startsWith('http') ? img.url : `http://localhost:3001${img.url}`}
                      alt={img.description || '酒店图片'}
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover' }}
                    />
                    {img.isMain && <Tag color="green" style={{ marginTop: 4 }}>主图</Tag>}
                    <div>{img.description}</div>
                  </div>
                ))}
              </Space>
            </div>
          ) : (
            <p>暂无图片</p>
          )}

          {/* 设施列表 */}
          {hotel.facilities && hotel.facilities.length > 0 ? (
            <div>
              <h3>酒店设施</h3>
              <Table
                dataSource={hotel.facilities}
                columns={[
                  { title: '设施名称', dataIndex: 'name', key: 'name' },
                  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          ) : (
            <p>暂无设施信息</p>
          )}

          {/* 附近景点列表 */}
          {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 ? (
            <div>
              <h3>附近景点</h3>
              <Table
                dataSource={hotel.nearbyAttractions}
                columns={[
                  { title: '景点名称', dataIndex: 'name', key: 'name' },
                  {
                    title: '类型',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type: string) => {
                      const typeMap: Record<string, string> = {
                        attraction: '景点',
                        transportation: '交通枢纽',
                        shopping: '购物中心',
                      };
                      return typeMap[type] || type;
                    }
                  },
                  { title: '距离', dataIndex: 'distance', key: 'distance' },
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          ) : (
            <p>暂无附近景点信息</p>
          )}

          {/* 标签列表 */}
          {hotel.tags && hotel.tags.length > 0 ? (
            <div>
              <h3>酒店标签</h3>
              <Space wrap>
                {hotel.tags.map(t => (
                  <Tag key={t.tag.id} color="blue">{t.tag.name}</Tag>
                ))}
              </Space>
            </div>
          ) : (
            <p>暂无标签</p>
          )}
        </Space>
      ) : (
        <p>未找到酒店信息</p>
      )}
    </Modal>
  );
}