/* eslint-disable react-hooks/exhaustive-deps */
import React, {  useEffect, useState,useRef } from "react";
import {
  
  Table,
 
  Select,
  Modal,
  Form,
  Input,
  Button,
  notification,
  Skeleton,
} from "antd";
import axios from "axios";
import { get } from "lodash";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import * as XLSX from 'xlsx';


function Location() {
  const [Location, setLocation] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [updateId, setUpdateId] = useState("");
	const [searched, setSearched] = useState([]);
  const tableRef = useRef(null);
  const [loading,setLoading]=useState(false)
  const [exporting,setExporting]=useState(false)
  const [loadingBtn,setLoadingBtn]=useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await axios.get(
        `${process.env.REACT_APP_URL}/api/location?search=${searched}`
      );
      setLocation(get(result, "data.message"));
    } catch (err) {
     
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, [searched]);

 

  const handleSubmit = async (value) => {
    if (updateId === "") {
      try {
        setLoadingBtn(true)
        await axios.post(`${process.env.REACT_APP_URL}/api/location`, value);
        fetchData();
        notification.success({
          message: "Location Added successfully",
        });
        setOpen(false);
        form.setFieldValue([]);
      } catch (err) {
        notification.error({
          message: "Something went wrong",
        });
      }finally{
        setLoadingBtn(false)
      }
    } else {
      try {
        setLoadingBtn(true)
        await axios.put(`${process.env.REACT_APP_URL}/api/location/${updateId}`, value);
        fetchData();
        notification.success({
          message: "Location updated successfully",
        });
        setOpen(false);
        form.setFieldValue([]);
        setUpdateId("");
      } catch (err) {
        notification.error({
          message: "Something went wrong",
        });
      }finally{
        setLoadingBtn(false)
      }
    }
  };

  const handleEdit = (value) => {
    form.setFieldsValue(value);
    setUpdateId(value._id);
    setOpen(true);
  };

  const handleDelete = async (value) => {
    try {
      await axios.delete(`${process.env.REACT_APP_URL}/api/location/${value._id}`);
      fetchData();
      notification.success({
        message: "Deleted Successfully",
      });
    } catch (err) {
      notification.error({
        message: "Something Went Wrong",
      });
    }
  };

  const handleClear = () => {
    form.setFieldsValue([]);
  };

  const searchers = [];

  Location &&
    Location.map((data) => {
   
      return searchers.push(
        { value: data.locationname }
     );
    });


    const exportToExcel = () => {
      if (!exporting) {
        const dataForExport = Location.map((location) => ({
          locationname: location.locationname, 
        }));
    
        const ws = XLSX.utils.json_to_sheet(dataForExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'exported_data.xlsx');
        setExporting(false);
      }
    };
	

  const columns = [
    {
      title: <h1 className="text-[12px] lg:text-[18px]">Location Name</h1>,
      dataIndex: "locationname",
      key: "locationname",
      render: (text) => <div className="text-[12px] lg:!text-[16px]">{text}</div>,
    },

    {
      title: <h1 className="text-[12px] lg:text-[18px]">Actions</h1>,
      render: (text) => (
        <div className="flex gap-1">
          <div>
            <EditNoteOutlinedIcon
              className="!text-md text-[--secondary-color] cursor-pointer"
              onClick={() => handleEdit(text)}
            />
          </div>

          <div>
            <DeleteOutlineOutlinedIcon
              className="!text-md text-[--secondary-color] cursor-pointer "
              onClick={() => {
                handleDelete(text);
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex pt-[12vh] pl-4">
      <div className="w-[75vw] flex flex-col gap-8">
        <div className="flex items-center justify-center">
          <Select
            mode="tags"
            showSearch
            placeholder="Type here for Location"
            options={searchers}
            onChange={(data) => {
              setSearched(data);
            }}
            className="w-[70vw] lg:w-1/2 !m-auto py-3"
            size="large"
            showArrow={false}
            // open={searched.length===1?false:true}
          />
        </div>
        <div className="w-full flex gap-5 items-end justify-end">
          <div
            className=" w-[120px] py-1 rounded-md cursor-pointer text-white font-bold  flex items-center justify-center bg-[--secondary-color]"
            onClick={() => {
              setOpen(true);
            }}
          >
            <AddOutlinedIcon />
            Create
          </div>
          <div>
            <Button
              onClick={()=>{exportToExcel(Location)}}
              className="w-[120px] py-1  rounded-md cursor-pointer text-white font-bold  flex items-center justify-center bg-[--secondary-color] hover:!text-white"
            >
              Export Exel
            </Button>
          </div>
        </div>
        <Skeleton loading={loading}>
        <Table columns={columns} dataSource={Location} ref={tableRef} pagination={{pageSize:5}} />
        </Skeleton>
      
      </div>
      <Modal
        open={open}
        destroyOnClose
        width={500}
        onCancel={() => {
          setOpen(!open);
          form.setFieldValue([]);
          setUpdateId("");
        }}
        footer={false}
       
      >
        <Form
          className="flex flex-col  gap-4"
          layout="vertical"
          onFinish={handleSubmit}
          form={form}
        >
          <Form.Item
            label={<p className="!text-[16px] font-semibold">Location Name</p>}
            name="locationname"
            rules={[
              {
                required: true,
                message: "Please input your Location Name!",
              },
            ]}
          >
            <Input type="text" size="large" placeholder="Enter location"/>
          </Form.Item>

          <div className="flex pl-20 lg:pl-0 lg:justify-end lg:items-end">
            
            <Form.Item className="w-[10vw]">
              <Button
              loading={loadingBtn}
                htmlType="submit"
                className="bg-red-500 lg:w-[130px]  text-white font-bold tracking-wider"
                onClick={handleClear}
              >
                Clear
              </Button>
            </Form.Item>
            <Form.Item className="w-[10vw] pl-10 lg:pl-0">
              <Button
                htmlType="submit"
                className="bg-green-500 lg:w-[130px]  text-white font-bold tracking-wider"
              >
                {updateId === "" ? "Save" : "Update"}{" "}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Location;
