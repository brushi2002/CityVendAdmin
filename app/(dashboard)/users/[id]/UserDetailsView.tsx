'use client';

import { useState } from 'react';
import { Card, Descriptions, Tag, Typography, Button, Input, message, Space } from 'antd';
import Link from 'next/link';
import { adminResetUserPassword } from '../../../actions';

const { Title } = Typography;

const statusColors: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'red' };
const statusText: Record<number, string> = { 1: 'Active', 2: 'Inactive', 3: 'Deleted' };

export default function UserDetailsView({ user }: { user: any }) {
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const status = user.Status ?? 0;

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      message.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      const result = await adminResetUserPassword(user.Id, newPassword);
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Password updated successfully');
        setNewPassword('');
      }
    } catch {
      message.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Link href="/users" style={{ marginBottom: 16, display: 'inline-block' }}>Back to Users</Link>
      <Title level={4}>
        {user.FirstName} {user.LastName} <Tag color={statusColors[status]}>{statusText[status]}</Tag>
      </Title>

      <Card title="User Information" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Email">{user.Email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.Phone}</Descriptions.Item>
          <Descriptions.Item label="Created On">{user.CreatedOn ? new Date(user.CreatedOn).toLocaleDateString() : '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {status !== 3 && (
        <Card title="Update Password" style={{ marginBottom: 16 }}>
          <Space>
            <Input.Password
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: 250 }}
            />
            <Button type="primary" loading={resetting} onClick={handleResetPassword}>
              Update Password
            </Button>
          </Space>
        </Card>
      )}

      {status === 3 && user.AccountDeletedOn && (
        <Card title="Deletion Info" style={{ marginBottom: 16 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="Deleted On">{new Date(user.AccountDeletedOn).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Reason">{user.AccountDeleteReason}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </>
  );
}
