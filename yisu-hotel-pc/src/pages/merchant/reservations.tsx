import { useEffect, useState } from 'react';
import { Button, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Layout from '../../components/Layout';
import RequireAuth from '../../components/RequireAuth';
import { Reservation, ReservationStatus } from '../../types';
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  getReservations,
} from '../../lib/api';

const { Title } = Typography;

const statusMap: Record<ReservationStatus, { color: string; text: string }> = {
  confirmed: { color: 'blue', text: '已确认' },
  check_in: { color: 'green', text: '已入住' },
  check_out: { color: 'default', text: '已退房' },
  cancelled: { color: 'red', text: '已取消' },
};

/**
 * 商户端酒店预订管理页面。
 *
 * 展示当前系统中的所有预订记录，并支持办理入住、退房和取消操作。
 *
 * @returns 预订管理页面组件
 */
export default function MerchantReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 加载预订列表数据。
   *
   * @returns Promise<void>
   */
  const loadReservations = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await getReservations();
      setReservations(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || '加载预订列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  /**
   * 处理预订状态操作（入住、退房、取消）。
   *
   * @param action 操作类型
   * @param id 预订 ID
   * @returns Promise<void>
   */
  const handleAction = async (
    action: 'checkIn' | 'checkOut' | 'cancel',
    id: string,
  ): Promise<void> => {
    try {
      if (action === 'checkIn') {
        await checkInReservation(id);
      } else if (action === 'checkOut') {
        await checkOutReservation(id);
      } else {
        await cancelReservation(id);
      }
      message.success('操作成功');
      void loadReservations();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '操作失败');
    }
  };

  const columns: ColumnsType<Reservation> = [
    {
      title: '预订ID',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      ellipsis: true,
    },
    {
      title: '酒店名称',
      dataIndex: ['hotel', 'nameZh'],
      key: 'hotelName',
      render: (_: unknown, record: Reservation) => record.hotel?.nameZh ?? '-',
    },
    {
      title: '房型名称',
      dataIndex: ['room', 'name'],
      key: 'roomName',
      render: (_: unknown, record: Reservation) => record.room?.name ?? '-',
    },
    {
      title: '客人姓名',
      dataIndex: 'guestName',
      key: 'guestName',
    },
    {
      title: '联系电话',
      dataIndex: 'guestPhone',
      key: 'guestPhone',
    },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (value: string) => value?.slice(0, 10),
    },
    {
      title: '离店日期',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      render: (value: string) => value?.slice(0, 10),
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (value: number) => `¥${value}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ReservationStatus) => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: Reservation) => (
        <Space>
          {record.status === 'confirmed' && (
            <Button
              size="small"
              type="primary"
              onClick={() => void handleAction('checkIn', record.id)}
            >
              入住
            </Button>
          )}
          {record.status === 'check_in' && (
            <Button
              size="small"
              onClick={() => void handleAction('checkOut', record.id)}
            >
              退房
            </Button>
          )}
          {record.status !== 'check_out' && record.status !== 'cancelled' && (
            <Button
              size="small"
              danger
              onClick={() => void handleAction('cancel', record.id)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <RequireAuth allowedRoles={['merchant']}>
      <Layout>
        <Space
          direction="vertical"
          size="large"
          style={{ width: '100%' }}
        >
          <Title level={3}>酒店预订管理</Title>
          <Table<Reservation>
            columns={columns}
            dataSource={reservations}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Layout>
    </RequireAuth>
  );
}

