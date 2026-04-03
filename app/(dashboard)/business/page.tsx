'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Tag, Typography, Card, Descriptions, Spin, Popconfirm, message } from 'antd';
import { SearchOutlined, ClearOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import { fetchUsers, fetchBusinessById, deleteBusiness } from '../../actions';

const { Title } = Typography;

const statusColors: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'red' };
const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>();
  const [expandedDetails, setExpandedDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [deleteReason, setDeleteReason] = useState('');
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

  const handleExpand = async (expanded: boolean, record: any) => {
    if (!expanded || expandedDetails[record.BusinessId]) return;

    setLoadingDetails((prev) => ({ ...prev, [record.BusinessId]: true }));
    try {
      const business = await fetchBusinessById(record.BusinessId);
      if (business) {
        setExpandedDetails((prev) => ({ ...prev, [record.BusinessId]: business }));
      }
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [record.BusinessId]: false }));
    }
  };

  // Soft-deletes the business by setting its owner vendor's status to Deleted
  const handleDelete = async (record: any) => {
    const result = await deleteBusiness(record.Id, deleteReason);
    if (result.success) {
      message.success('Business deleted');
      setDeleteReason('');
      setExpandedDetails((prev) => {
        const next = { ...prev };
        delete next[record.BusinessId];
        return next;
      });
      load(page, pageSize, filterName, filterEmail, filterStatus);
    } else if ('error' in result) {
      message.error(result.error);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'UserName' },
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

  const expandedRowRender = (record: any) => {
    const business = expandedDetails[record.BusinessId];

    if (loadingDetails[record.BusinessId] || !business) {
      return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;
    }

    return (
      <div style={{ padding: '8px 0' }}>
        <Card title="Contact Information" size="small" style={{ marginBottom: 12 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Phone">{business.PhoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Email">{business.Email}</Descriptions.Item>
            <Descriptions.Item label="Website">{business.Website}</Descriptions.Item>
            <Descriptions.Item label="Category">{business.Category}</Descriptions.Item>
            <Descriptions.Item label="Type">{business.Type}</Descriptions.Item>
            <Descriptions.Item label="Group">{business.GroupName}</Descriptions.Item>
            <Descriptions.Item label="Subscription">
              <Tag color={business.IsSubscribed ? 'green' : 'default'}>{business.IsSubscribed ? 'Subscribed' : 'Not Subscribed'}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Primary Address" size="small" style={{ marginBottom: 12 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Address">{[business.Address1, business.Address2].filter(Boolean).join(', ')}</Descriptions.Item>
            <Descriptions.Item label="City">{business.City}</Descriptions.Item>
            <Descriptions.Item label="State">{business.State}</Descriptions.Item>
            <Descriptions.Item label="Zip">{business.Zip}</Descriptions.Item>
          </Descriptions>
        </Card>

        {business.CurrentAddress1 && (
          <Card title="Current Location" size="small" style={{ marginBottom: 12 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Address">{[business.CurrentAddress1, business.CurrentAddress2].filter(Boolean).join(', ')}</Descriptions.Item>
              <Descriptions.Item label="City">{business.CurrentCity}</Descriptions.Item>
              <Descriptions.Item label="State">{business.CurrentState}</Descriptions.Item>
              <Descriptions.Item label="Zip">{business.CurrentZip}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {business.MessageFromOwner && (
          <Card title="Owner&apos;s Message" size="small" style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>{business.MessageFromOwner}</p>
          </Card>
        )}

        {business.AdditionalInformation && (
          <Card title="Additional Information" size="small" style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>{business.AdditionalInformation}</p>
          </Card>
        )}

        {business.Hours?.length > 0 && (
          <Card title="Business Hours" size="small" style={{ marginBottom: 12 }}>
            <Table
              rowKey="Id"
              dataSource={business.Hours}
              pagination={false}
              size="small"
              columns={[
                { title: 'Day', dataIndex: 'DayId', render: (val: number) => dayNames[val] || val },
                { title: 'Start', dataIndex: 'StartTime' },
                { title: 'End', dataIndex: 'EndTime' },
              ]}
            />
          </Card>
        )}

        {business.AccountDeletedOn && (
          <Card title="Deletion Info" size="small" style={{ marginBottom: 12 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Deleted On">{new Date(business.AccountDeletedOn).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Reason">{business.AccountDeleteReason}</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {business.Status !== 3 && (
          <Popconfirm
            title="Delete this business?"
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
            <Button danger icon={<DeleteOutlined />}>Delete Business</Button>
          </Popconfirm>
        )}
      </div>
    );
  };

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
        expandable={{
          expandedRowRender,
          onExpand: handleExpand,
        }}
        style={{ background: '#fff', borderRadius: 8 }}
      />
    </>
  );
}
