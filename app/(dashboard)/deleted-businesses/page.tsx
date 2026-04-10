'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, Typography, Card, Descriptions, Spin, message } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd';
import { fetchUsers, fetchBusinessById, fetchUserById, fetchHotspotsByBusinessId } from '../../actions';

const { Title } = Typography;

const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hotspotStatusLabel: Record<number, string> = { 1: 'Payment Pending', 2: 'Active', 3: 'Ended', 4: 'Payment Failed' };
const hotspotStatusColor: Record<number, string> = { 1: 'orange', 2: 'green', 3: 'default', 4: 'red' };

export default function DeletedBusinessesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [expandedDetails, setExpandedDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [errorDetails, setErrorDetails] = useState<Record<number, string>>({});
  const [deletedUserDetails, setDeletedUserDetails] = useState<Record<number, any>>({});
  const [hotspotDetails, setHotspotDetails] = useState<Record<number, any[]>>({});

  const load = async (pg: number, ps: number, name?: string, email?: string) => {
    setLoading(true);
    try {
      const result = await fetchUsers({
        PageIndex: pg,
        PageSize: ps,
        Role: 2,
        UserName: name || undefined,
        UserEmail: email || undefined,
        Status: 3,
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
    load(1, pageSize, filterName, filterEmail);
  };

  const handleClear = () => {
    setFilterName('');
    setFilterEmail('');
    setPage(1);
    load(1, pageSize);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const pg = pagination.current || 1;
    const ps = pagination.pageSize || 10;
    setPage(pg);
    setPageSize(ps);
    load(pg, ps, filterName, filterEmail);
  };

  const handleExpand = async (expanded: boolean, record: any) => {
    const key = record.BusinessId ?? record.Id;
    if (!expanded || expandedDetails[key]) return;

    setLoadingDetails((prev) => ({ ...prev, [key]: true }));
    setErrorDetails((prev) => { const next = { ...prev }; delete next[key]; return next; });
    try {
      const businessId = record.BusinessId ?? record.Id;
      const business = await fetchBusinessById(businessId);
      if (business) {
        setExpandedDetails((prev) => ({ ...prev, [key]: business }));
        const hotspots = await fetchHotspotsByBusinessId(businessId);
        setHotspotDetails((prev) => ({ ...prev, [key]: hotspots }));
      } else {
        // Deleted businesses: fall back to vendor user record for deletion info
        const user = await fetchUserById(record.Id);
        if (user) {
          setDeletedUserDetails((prev) => ({ ...prev, [key]: user }));
        } else {
          setErrorDetails((prev) => ({ ...prev, [key]: 'Could not load details for this deleted business.' }));
        }
      }
    } catch (err: any) {
      setErrorDetails((prev) => ({ ...prev, [key]: err?.message || 'Failed to load business details' }));
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [key]: false }));
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'UserName' },
    { title: 'Email', dataIndex: 'Email' },
    { title: 'Phone', dataIndex: 'Phone' },
    { title: 'Business Name', dataIndex: 'BusinessName' },
    { title: 'Category', dataIndex: 'BusinessCategory' },
    { title: 'Type', dataIndex: 'BusinessType' },
    {
      title: 'Created On',
      dataIndex: 'CreatedOn',
      render: (val: string) => val ? new Date(val).toLocaleDateString() : '',
    },
  ];

  const expandedRowRender = (record: any) => {
    const key = record.BusinessId ?? record.Id;
    const business = expandedDetails[key];
    const deletedUser = deletedUserDetails[key];
    const hotspots: any[] = hotspotDetails[key] ?? [];

    if (loadingDetails[key]) {
      return <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>;
    }

    if (errorDetails[key]) {
      return <div style={{ padding: 24, color: 'red' }}>{errorDetails[key]}</div>;
    }

    // Deleted businesses: show deletion info from the vendor user record
    if (!business && deletedUser) {
      return (
        <div style={{ padding: '8px 0' }}>
          <Card title="Deletion Info" size="small" style={{ marginBottom: 12 }}>
            <Descriptions column={1} size="small">
              {deletedUser.AccountDeletedOn && (
                <Descriptions.Item label="Deleted On">{new Date(deletedUser.AccountDeletedOn).toLocaleDateString()}</Descriptions.Item>
              )}
              <Descriptions.Item label="Reason">{deletedUser.AccountDeleteReason || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      );
    }

    if (!business) {
      return <div style={{ padding: 24, color: 'red' }}>Failed to load business details.</div>;
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
          <Card title="Owner's Message" size="small" style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>{business.MessageFromOwner}</p>
          </Card>
        )}

        {business.AdditionalInformation && (
          <Card title="Additional Information" size="small" style={{ marginBottom: 12 }}>
            <p style={{ margin: 0 }}>{business.AdditionalInformation}</p>
          </Card>
        )}

        <Card title="Hotspots" size="small" style={{ marginBottom: 12 }}>
          {hotspots.length === 0 ? (
            <p style={{ margin: 0, color: '#999' }}>No hotspots purchased.</p>
          ) : (
            <Table
              rowKey="Id"
              dataSource={hotspots}
              pagination={false}
              size="small"
              columns={[
                { title: 'Purchased', dataIndex: 'AddedOn', render: (v: any) => v ? new Date(v).toLocaleString() : '—' },
                { title: 'Radius', dataIndex: 'RadiusInMiles', render: (v: number) => `${v} mi` },
                { title: 'Active Window', render: (_: any, r: any) => r.StartsAt && r.EndsAt
                    ? `${new Date(r.StartsAt).toLocaleString()} – ${new Date(r.EndsAt).toLocaleString()}`
                    : '—'
                },
                { title: 'Status', dataIndex: 'Status', render: (v: number) =>
                    <Tag color={hotspotStatusColor[v] ?? 'default'}>{hotspotStatusLabel[v] ?? v}</Tag>
                },
                { title: 'Message', dataIndex: 'Message' },
              ]}
            />
          )}
        </Card>

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

        <Card title="Deletion Info" size="small" style={{ marginBottom: 12 }}>
          <Descriptions column={1} size="small">
            {business.AccountDeletedOn && (
              <Descriptions.Item label="Deleted On">{new Date(business.AccountDeletedOn).toLocaleDateString()}</Descriptions.Item>
            )}
            <Descriptions.Item label="Reason">{business.AccountDeleteReason || '—'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Title level={4}>Deleted Businesses</Title>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="Name" value={filterName} onChange={(e) => setFilterName(e.target.value)} onPressEnter={handleSearch} style={{ width: 180 }} />
          <Input placeholder="Email" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} onPressEnter={handleSearch} style={{ width: 180 }} />
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
