import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../../components/Layout';
import RequireAuth from '../../../../components/RequireAuth';
import HotelForm from '../../../../components/HotelForm';
import { getHotel, updateHotel, uploadHotelImage, updateHotelImage, deleteHotelImage } from '../../../../lib/api';
import { CreateHotelDto, Hotel } from '../../../../types';
import { message } from 'antd';
import dayjs from 'dayjs';

export default function EditHotel() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [hotel, setHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    if (id) {
      loadHotel();
    }
  }, [id]);

  const loadHotel = async () => {
    try {
      const data = await getHotel(id as string);
      setHotel(data);
    } catch (error) {
      message.error('加载酒店信息失败');
    }
  };

  // 将酒店数据转换为表单初始值
  const getDefaultValues = (): any => {
    if (!hotel) return undefined;
    return {
      ...hotel,
      openingDate: dayjs(hotel.openingDate),
      rooms: hotel.rooms,
      promotions: hotel.promotions?.map(p => ({
        ...p,
        startDate: dayjs(p.startDate),
        endDate: dayjs(p.endDate),
      })),
      nearbyAttractions: hotel.nearbyAttractions,
      facilities: hotel.facilities,
      tagIds: hotel.tags?.map(t => t.tag.id),
    };
  };

  // 更新已有图片信息
  const handleUpdateImage = async (imageId: string, data: { description?: string; isMain?: boolean }) => {
    try {
      await updateHotelImage(id as string, imageId, data);

      // 乐观更新本地状态，避免重新请求
      setHotel(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          images: (prev.images || []).map(img =>
            img.id === imageId
              ? { ...img, ...data }
              : data.isMain
                ? { ...img, isMain: false } // 如果设置主图，其他图取消主图
                : img
          ),
        };
      });

      message.success('图片更新成功');
    } catch (error) {
      message.error('图片更新失败');
    }
  };

  // 删除已有图片
  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteHotelImage(id as string, imageId);
      setHotel(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          images: (prev.images || []).filter(img => img.id !== imageId),
        };
      });
      message.success('图片删除成功');
    } catch (error) {
      message.error('图片删除失败');
    }
  };

  // 提交表单时处理新图片上传
  const onSubmit = async (
    data: CreateHotelDto,
    fileList: any[],
    imageDescriptions: { [key: string]: string },
    mainImageIndex: number
  ) => {
    setLoading(true);
    try {
      // 更新酒店基础信息
      const payload = {
        ...data,
        openingDate: (data.openingDate as any).toISOString(),
        rooms: data.rooms?.map(r => ({
          ...r,
          price: Number(r.price),
          capacity: Number(r.capacity),
          quantity: Number(r.quantity),
        })),
        promotions: data.promotions?.map(p => ({
          ...p,
          discountValue: Number(p.discountValue),
          startDate: (p.startDate as any).toISOString(),
          endDate: (p.endDate as any).toISOString(),
        })),
        nearbyAttractions: data.nearbyAttractions,
        facilities: data.facilities,
        tagIds: data.tagIds,
      };

      await updateHotel(id as string, payload);

      // 上传新图片
      if (fileList.length > 0) {
        const uploadPromises = fileList.map((file, index) => {
          const formData = new FormData();
          formData.append('file', file.originFileObj);
          formData.append('description', imageDescriptions[file.uid] || '');
          formData.append('isMain', String(mainImageIndex === index));
          return uploadHotelImage(id as string, formData);
        });

        await Promise.all(uploadPromises);

        await loadHotel();

        message.success(`酒店更新成功，已上传 ${fileList.length} 张图片`);
      } else {
        message.success('酒店更新成功');
        await loadHotel();
      }

      router.push('/merchant/hotels');
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) return <div>加载中...</div>;

  return (
    <RequireAuth allowedRoles={['merchant']}>
      <Layout>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">编辑酒店</h2>
          <HotelForm
            defaultValues={getDefaultValues()}
            onSubmit={onSubmit}
            loading={loading}
            existingImages={hotel.images || []}
            onUpdateImage={handleUpdateImage}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      </Layout>
    </RequireAuth>
  );
}