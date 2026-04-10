'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Tag, Typography, Card, Descriptions, Spin, Popconfirm, message } from 'antd';
import { SearchOutlined, ClearOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import { fetchUsers, fetchUserById, deleteUser, adminResetUserPassword } from '../../actions';

const { Title } = Typography;

const statusColors: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'red' };
const statusText: Record<number, string> = { 1: 'Active', 2: 'Inactive', 3: 'Deleted' };

export default function UserListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>();
  const [expandedUsers, setExpandedUsers] = useState<Record<number, any>>({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [deleteReason, setDeleteReason] = useState('');
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [resettingPassword, setResettingPassword] = useState<Record<number, boolean>>({});

  const load = async (pg: number, ps: number, name?: string, email?: string, status?: number) => {
    setLoading(true);
    try {
      const result = await fetchUsers({
        PageIndex: pg,
        PageSize: ps,
        Role: 3,
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

  const handleExpand = async (expanded: boolean, record: any) => {
    if (!expanded || expandedUsers[record.Id]) return;

    setLoadingUsers((prev) => ({ ...prev, [record.Id]: true }));
    try {
      const user = await fetchUserById(record.Id);
      if (user) {
        setExpandedUsers((prev) => ({ ...prev, [record.Id]: user }));
      }
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [record.Id]: false }));
    }
  };

  const handleDelete = async (record: any) => {
    const result = await deleteUser(record.Id, deleteReason);
    if (result.success) {
      message.success('User deleted');
      setDeleteReason('');
      setExpandedUsers((prev) => {
        const next = { ...prev };
        delete next[record.Id];
        return next;
      });
      load(page, pageSize, filterName, filterEmail, filterStatus);
    } else if ('error' in result) {
      message.error(result.error);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = passwords[userId];
    if (!newPassword || newPassword.length < 6) {
      message.error('Password must be at least 6 characters');
      return;
    }
    setResettingPassword((prev) => ({ ...prev, [userId]: true }));
    try {
      const result = await adminResetUserPassword(userId, newPassword);
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Password updated successfully');
        setPasswords((prev) => ({ ...prev, [userId]: '' }));
      }
    } catch {
      message.error('Failed to reset password');
    } finally {
      setResettingPassword((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'UserName' },
    { title: 'Email', dataIndex: 'Email' },
    { title: 'Phone', dataIndex: 'Phone' },
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

  const expandedRowRender = (record: any) => {
    const user = expandedUsers[record.Id];

    if (loadingUsers[record.Id] || !user) {
      return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;
    }

    const status = user.Status ?? 0;

    return (
      <div style={{ padding: '8px 0' }}>
        <Card title="User Information" size="small" style={{ marginBottom: 12 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Email">{user.Email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{user.Phone}</Descriptions.Item>
            <Descriptions.Item label="Created On">{user.CreatedOn ? new Date(user.CreatedOn).toLocaleDateString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[status]}>{statusText[status]}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {status !== 3 && (
          <Card title="Update Password" size="small" style={{ marginBottom: 12 }}>
            <Space>
              <Input.Password
                placeholder="New Password"
                value={passwords[record.Id] || ''}
                onChange={(e) => setPasswords((prev) => ({ ...prev, [record.Id]: e.target.value }))}
                style={{ width: 250 }}
              />
              <Button type="primary" loading={resettingPassword[record.Id]} onClick={() => handleResetPassword(record.Id)}>
                Update Password
              </Button>
            </Space>
          </Card>
        )}

        {status === 3 && (
          <Card title="Deletion Info" size="small" style={{ marginBottom: 12 }}>
            <Descriptions column={1} size="small">
              {user.AccountDeletedOn && (
                <Descriptions.Item label="Deleted On">{new Date(user.AccountDeletedOn).toLocaleDateString()}</Descriptions.Item>
              )}
              <Descriptions.Item label="Reason">{user.AccountDeleteReason || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {status !== 3 && (
          <Popconfirm
            title="Delete this user?"
            description={
              <Input.TextArea
                placeholder="Reason for deletion (optional)"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={2}
                style={{ marginTop: 8 }}
              />
            }
            onConfirm={() => handleDelete(record)}
            onCancel={() => setDeleteReason('')}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>Delete User</Button>
          </Popconfirm>
        )}
      </div>
    );
  };

  return (
    <>
      <Title level={4}>Users</Title>
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
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
        }}
        style={{ background: '#fff', borderRadius: 8 }}
      />
    </>
  );
}
