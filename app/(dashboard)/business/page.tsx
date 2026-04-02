'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Tag, Typography, Card } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import Link from 'next/link';
import { fetchUsers } from '../../actions';

const { Title } = Typography;

const statusColors: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'red' };

export default function BusinessListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>();

  const load = async (pg: number, ps: number, name?: string, email?: string, status?: number) => {
    setLoading(true);
    try {
      const result = await fetchUsers({
        PageIndex: pg,
        PageSize: ps,
        Role: 2,
        UserName: name || undefined,
        UserEmail: email || undefined,
        Status: status,
      });
      setData(result.ResultData || []);
      setTotal(result.RowCount || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, 10); }, []);

  const handleSearch = () => {
    setPage(1);
    load(1, pageSize, filterName, filterEmail, filterStatus);
  };

  const handleClear = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterStatus(undefined);
    setPage(1);
    load(1, pageSize);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const pg = pagination.current || 1;
    const ps = pagination.pageSize || 10;
    setPage(pg);
    setPageSize(ps);
    load(pg, ps, filterName, filterEmail, filterStatus);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'UserName',
      render: (text: string, record: any) => <Link href={`/business/${record.BusinessId}`}>{text}</Link>,
    },
    { title: 'Email', dataIndex: 'Email' },
    { title: 'Phone', dataIndex: 'Phone' },
    { title: 'Category', dataIndex: 'BusinessCategory' },
    { title: 'Type', dataIndex: 'BusinessType' },
    {
      title: 'Status',
      dataIndex: 'StatusText',
      render: (text: string, record: any) => <Tag color={statusColors[record.Status]}>{text}</Tag>,
    },
    {
      title: 'Created On',
      dataIndex: 'CreatedOn',
      render: (val: string) => val ? new Date(val).toLocaleDateString() : '',
    },
  ];

  return (
    <>
      <Title level={4}>Business</Title>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} onPressEnter={handleSearch} style={{ width: 180 }} />
          <Input placeholder="Email" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} onPressEnter={handleSearch} style={{ width: 180 }} />
          <Select
            placeholder="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            style={{ width: 130 }}
            options={[
              { value: 1, label: 'Active' },
              { value: 2, label: 'Inactive' },
              { value: 3, label: 'Deleted' },
            ]}
          />
          <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>Search</Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>Clear</Button>
        </Space>
      </Card>
      <Table
        rowKey="Id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true }}
        onChange={handleTableChange}
        style={{ background: '#fff', borderRadius: 8 }}
      />
    </>
  );
}
