'use client';

import { Card, Descriptions, Tag, Table, Typography } from 'antd';
import Link from 'next/link';

const { Title } = Typography;

const statusColors: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'red' };
const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessDetailsView({ business }: { business: any }) {
  return (
    <>
      <Link href="/business" style={{ marginBottom: 16, display: 'inline-block' }}>Back to Business List</Link>
      <Title level={4}>
        {business.Name} <Tag color={statusColors[business.Status]}>{business.StatusText}</Tag>
      </Title>

      <Card title="Contact Information" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Phone">{business.PhoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Email">{business.Email}</Descriptions.Item>
          <Descriptions.Item label="Website">{business.Website}</Descriptions.Item>
          <Descriptions.Item label="Category">{business.Category}</Descriptions.Item>
          <Descriptions.Item label="Type">{business.Type}</Descriptions.Item>
          <Descriptions.Item label="Group">{business.GroupName}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Primary Address" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Address">{[business.Address1, business.Address2].filter(Boolean).join(', ')}</Descriptions.Item>
          <Descriptions.Item label="City">{business.City}</Descriptions.Item>
          <Descriptions.Item label="State">{business.State}</Descriptions.Item>
          <Descriptions.Item label="Zip">{business.Zip}</Descriptions.Item>
        </Descriptions>
      </Card>

      {business.CurrentAddress1 && (
        <Card title="Current Location" style={{ marginBottom: 16 }}>
          <Descriptions column={2}>
            <Descriptions.Item label="Address">{[business.CurrentAddress1, business.CurrentAddress2].filter(Boolean).join(', ')}</Descriptions.Item>
            <Descriptions.Item label="City">{business.CurrentCity}</Descriptions.Item>
            <Descriptions.Item label="State">{business.CurrentState}</Descriptions.Item>
            <Descriptions.Item label="Zip">{business.CurrentZip}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {business.MessageFromOwner && (
        <Card title="Owner's Message" style={{ marginBottom: 16 }}>
          <p>{business.MessageFromOwner}</p>
        </Card>
      )}

      {business.AdditionalInformation && (
        <Card title="Additional Information" style={{ marginBottom: 16 }}>
          <p>{business.AdditionalInformation}</p>
        </Card>
      )}

      {business.Hours?.length > 0 && (
        <Card title="Business Hours" style={{ marginBottom: 16 }}>
          <Table
            rowKey="Id"
            dataSource={business.Hours}
            pagination={false}
            columns={[
              { title: 'Day', dataIndex: 'DayId', render: (val: number) => dayNames[val] || val },
              { title: 'Start', dataIndex: 'StartTime' },
              { title: 'End', dataIndex: 'EndTime' },
            ]}
          />
        </Card>
      )}

      {business.AccountDeletedOn && (
        <Card title="Deletion Info" style={{ marginBottom: 16 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="Deleted On">{new Date(business.AccountDeletedOn).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Reason">{business.AccountDeleteReason}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </>
  );
}
